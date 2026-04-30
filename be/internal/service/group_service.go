package service

import (
	"context"

	"github.com/redis/go-redis/v9"

	"banhcuon/be/internal/db"
	"banhcuon/be/internal/repository"
)

// GroupService manages multi-table order groups.
// NOTE: Requires migration 008 (adds group_id CHAR(36) to orders table) to function.
type GroupService struct {
	orderRepo repository.OrderRepository
	rdb       *redis.Client
}

// NewGroupService creates a GroupService.
func NewGroupService(orderRepo repository.OrderRepository, rdb *redis.Client) *GroupService {
	return &GroupService{orderRepo: orderRepo, rdb: rdb}
}

// CreateGroup assigns a shared group_id to a set of active, ungrouped orders.
func (s *GroupService) CreateGroup(ctx context.Context, orderIDs []string) (string, error) {
	groupID := newUUID()
	for _, orderID := range orderIDs {
		if _, err := s.orderRepo.GetOrderByID(ctx, orderID); err != nil {
			return "", ErrNotFound
		}
		if err := s.setGroupID(ctx, orderID, groupID); err != nil {
			return "", err
		}
	}
	return groupID, nil
}

// GetGroupOrders returns all enriched orders belonging to a group_id.
func (s *GroupService) GetGroupOrders(ctx context.Context, groupID string) ([]OrderDetails, error) {
	orders, err := s.listOrdersByGroupID(ctx, groupID)
	if err != nil {
		return nil, err
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
	return s.setGroupID(ctx, orderID, "")
}

// DisbandGroup clears group_id on all orders in the group.
func (s *GroupService) DisbandGroup(ctx context.Context, groupID string) error {
	orders, err := s.listOrdersByGroupID(ctx, groupID)
	if err != nil {
		return err
	}
	for _, o := range orders {
		_ = s.setGroupID(ctx, o.ID, "")
	}
	return nil
}

// setGroupID updates the group_id column — requires migration 008.
func (s *GroupService) setGroupID(_ context.Context, _, _ string) error {
	return NewAppError(501, "NOT_IMPLEMENTED", "Tính năng nhóm bàn yêu cầu migration 008")
}

// listOrdersByGroupID returns orders with a given group_id — requires migration 008.
func (s *GroupService) listOrdersByGroupID(_ context.Context, _ string) ([]db.Order, error) {
	return nil, NewAppError(501, "NOT_IMPLEMENTED", "Tính năng nhóm bàn yêu cầu migration 008")
}
