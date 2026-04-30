package service

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/repository"
)

// GroupService manages multi-table order groups.
type GroupService struct {
	orderRepo repository.OrderRepository
	rdb       *redis.Client
}

// NewGroupService creates a GroupService.
func NewGroupService(orderRepo repository.OrderRepository, rdb *redis.Client) *GroupService {
	return &GroupService{orderRepo: orderRepo, rdb: rdb}
}

// CreateGroup assigns a new shared group_id to a set of ungrouped active orders (GRP-001).
func (s *GroupService) CreateGroup(ctx context.Context, orderIDs []string) (string, error) {
	for _, id := range orderIDs {
		o, err := s.orderRepo.GetOrderByID(ctx, id)
		if err != nil {
			if err == sql.ErrNoRows {
				return "", ErrNotFound
			}
			return "", fmt.Errorf("group: get order %s: %w", id, err)
		}
		if o.GroupID.Valid {
			return "", ErrAlreadyGrouped
		}
	}
	groupID := newUUID()
	for _, id := range orderIDs {
		if err := s.orderRepo.SetOrderGroupID(ctx, id, groupID); err != nil {
			return "", fmt.Errorf("group: set group_id on %s: %w", id, err)
		}
	}
	s.publishGroupEvent(ctx, groupID, "group_created")
	return groupID, nil
}

// AddToGroup links an additional order into an existing group (GRP-001 check).
func (s *GroupService) AddToGroup(ctx context.Context, groupID, orderID string) error {
	o, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return fmt.Errorf("group: get order %s: %w", orderID, err)
	}
	if o.GroupID.Valid {
		return ErrAlreadyGrouped
	}
	if err := s.orderRepo.SetOrderGroupID(ctx, orderID, groupID); err != nil {
		return fmt.Errorf("group: add to group: %w", err)
	}
	s.publishGroupEvent(ctx, groupID, "group_updated")
	return nil
}

// GetGroupOrders returns all enriched orders belonging to a group_id.
func (s *GroupService) GetGroupOrders(ctx context.Context, groupID string) ([]OrderDetails, error) {
	orders, err := s.orderRepo.ListOrdersByGroupID(ctx, groupID)
	if err != nil {
		return nil, fmt.Errorf("group: list orders: %w", err)
	}
	result := make([]OrderDetails, 0, len(orders))
	for _, o := range orders {
		items, _ := s.orderRepo.GetOrderItemsByOrderID(ctx, o.ID)
		enriched := make([]OrderItemDetails, 0, len(items))
		for _, item := range items {
			enriched = append(enriched, OrderItemDetails{
				OrderItem:  item,
				ItemStatus: itemStatus(item.QtyServed, item.Quantity),
			})
		}
		result = append(result, OrderDetails{Order: o, Items: enriched})
	}
	return result, nil
}

// RemoveFromGroup clears the group_id on a single order.
func (s *GroupService) RemoveFromGroup(ctx context.Context, orderID string) error {
	o, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return fmt.Errorf("group: get order: %w", err)
	}
	if !o.GroupID.Valid {
		return nil // already ungrouped — idempotent
	}
	groupID := o.GroupID.String
	if err := s.orderRepo.ClearOrderGroupID(ctx, orderID); err != nil {
		return fmt.Errorf("group: clear group_id: %w", err)
	}
	s.publishGroupEvent(ctx, groupID, "group_updated")
	return nil
}

// DisbandGroup clears group_id on all orders in the group.
func (s *GroupService) DisbandGroup(ctx context.Context, groupID string) error {
	orders, err := s.orderRepo.ListOrdersByGroupID(ctx, groupID)
	if err != nil {
		return fmt.Errorf("group: list for disband: %w", err)
	}
	for _, o := range orders {
		_ = s.orderRepo.ClearOrderGroupID(ctx, o.ID)
	}
	s.publishGroupEvent(ctx, groupID, "group_disbanded")
	return nil
}

// HasOrderInGroup reports whether orderID belongs to groupID (for guest auth check).
func (s *GroupService) HasOrderInGroup(ctx context.Context, groupID, orderID string) bool {
	o, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		return false
	}
	return o.GroupID.Valid && o.GroupID.String == groupID
}

// publishGroupEvent sends a Redis pub/sub message on the group channel.
func (s *GroupService) publishGroupEvent(ctx context.Context, groupID, eventType string) {
	_ = s.rdb.Publish(ctx, fmt.Sprintf("group:%s", groupID),
		fmt.Sprintf(`{"type":%q,"group_id":%q}`, eventType, groupID)).Err()
}

// groupOrderJSON builds the combined group response per §12.3 of Spec4.
func GroupOrderJSON(group []OrderDetails) []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(group))
	for _, o := range group {
		out = append(out, map[string]interface{}{
			"id":             o.ID,
			"order_number":   o.OrderNumber,
			"table_id":       nullStr(o.TableID),
			"status":         string(o.Status),
			"total_amount":   ParsePrice(o.TotalAmount),
			"group_id":       nullStr(o.GroupID),
			"items":          buildItemsJSON(o.Items),
		})
	}
	return out
}

func buildItemsJSON(items []OrderItemDetails) []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(items))
	for _, it := range items {
		out = append(out, map[string]interface{}{
			"id":          it.ID,
			"name":        it.Name,
			"quantity":    it.Quantity,
			"qty_served":  it.QtyServed,
			"unit_price":  ParsePrice(it.UnitPrice),
			"item_status": it.ItemStatus,
		})
	}
	return out
}

func nullStr(ns sql.NullString) interface{} {
	if ns.Valid {
		return ns.String
	}
	return nil
}
