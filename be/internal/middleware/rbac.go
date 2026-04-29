package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// roleLevel maps roles to their hierarchy level.
// Values match CLAUDE.md: customer=1, chef=2, cashier=2, staff=3, manager=4, admin=5.
// customer is isolated (level 1) and is NOT part of the staff hierarchy.
var roleLevel = map[string]int{
	"customer": 1,
	"chef":     2,
	"cashier":  2,
	"staff":    3,
	"manager":  4,
	"admin":    5,
}

// RequireRole aborts with AUTH_003 if the authenticated role is NOT in the allowed list.
//
// Example:
//
//	r.DELETE("/staff/:id", AuthRequired(), RequireRole("admin"))
func RequireRole(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(c *gin.Context) {
		role := RoleFromContext(c)
		if _, ok := allowed[role]; !ok {
			abortForbidden(c)
			return
		}
		c.Next()
	}
}

// AtLeast aborts with AUTH_003 if the authenticated role's hierarchy level is below minRole.
// Panics at startup if minRole is unknown — prevents silent security holes.
//
// Example:
//
//	r.GET("/orders", AuthRequired(), AtLeast("cashier")) // cashier, staff, manager, admin
func AtLeast(minRole string) gin.HandlerFunc {
	minLevel, ok := roleLevel[minRole]
	if !ok {
		panic("middleware.AtLeast: unknown role: " + minRole)
	}
	return func(c *gin.Context) {
		role := RoleFromContext(c)
		level, known := roleLevel[role]
		if !known || level < minLevel {
			abortForbidden(c)
			return
		}
		c.Next()
	}
}

// RequireOwner allows the resource owner OR admin/manager to access the resource.
// getOwnerID extracts the owner's staff ID from the request.
func RequireOwner(getOwnerID func(c *gin.Context) string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := RoleFromContext(c)
		if roleLevel[role] >= roleLevel["manager"] {
			c.Next()
			return
		}
		staffID := StaffIDFromContext(c)
		ownerID := getOwnerID(c)
		if staffID == "" || ownerID == "" || staffID != ownerID {
			abortForbidden(c)
			return
		}
		c.Next()
	}
}

// CustomerOrStaff allows either an authenticated customer OR any staff member.
// Used for order tracking where both the placing customer and staff can read.
func CustomerOrStaff() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := RoleFromContext(c)
		if role == "customer" || roleLevel[role] >= roleLevel["cashier"] {
			c.Next()
			return
		}
		abortForbidden(c)
	}
}

func abortForbidden(c *gin.Context) {
	c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
		"error":   "AUTH_003",
		"message": "Không đủ quyền truy cập",
	})
}
