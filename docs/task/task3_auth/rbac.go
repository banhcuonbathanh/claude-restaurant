// internal/middleware/rbac.go
// RBAC middleware: role-based access control for Gin routes.
// Ref: MASTER.docx §3 — Role hierarchy: admin ⊃ manager ⊃ staff ⊃ (chef | cashier) | customer.
// Ref: MASTER.docx §7 — AUTH_003 error code.
//
// Usage patterns (from MASTER.docx §3 RBAC Middleware Pattern):
//
//	RequireRole("admin", "manager")  — whitelist: only these exact roles
//	AtLeast("staff")                 — role >= staff in hierarchy
//	RequireOwner(getOwnerID)         — resource owner OR admin/manager
//
// IMPORTANT: These middleware MUST be chained AFTER AuthRequired.
// They read claims set by AuthRequired — if no claims, they will abort.
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// roleLevel maps roles to their hierarchy level for AtLeast comparisons.
// Higher number = more privilege.
// customer is isolated (level 0) — not part of the staff hierarchy.
var roleLevel = map[string]int{
	"customer": 0,
	"chef":     1,
	"cashier":  1, // chef and cashier are peers at level 1
	"staff":    2,
	"manager":  3,
	"admin":    4,
}

// RequireRole aborts with AUTH_003 if the authenticated role is NOT in the allowed list.
// Use for endpoints that only specific roles should access.
//
// Example:
//
//	r.DELETE("/api/v1/staff/:id", middleware.AuthRequired(svc), middleware.RequireRole("admin"))
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
// Use for endpoints accessible by minRole and any role above it.
//
// Example:
//
//	r.GET("/api/v1/orders", middleware.AuthRequired(svc), middleware.AtLeast("cashier"))
//	// → accessible by cashier, chef, staff, manager, admin; NOT customer.
func AtLeast(minRole string) gin.HandlerFunc {
	minLevel, ok := roleLevel[minRole]
	if !ok {
		// Panic at startup if minRole is typo'd — better than silent security hole.
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

// RequireOwner allows access only if the authenticated staff is the resource owner
// OR has admin/manager privileges.
// getOwnerID is a function that extracts the owner's staff ID from the request
// (e.g., from path param or DB lookup).
//
// Example:
//
//	r.PATCH("/api/v1/orders/:id/cancel", middleware.AuthRequired(svc),
//	    middleware.RequireOwner(func(c *gin.Context) string {
//	        return orderService.GetOwnerID(c.Param("id"))
//	    }))
func RequireOwner(getOwnerID func(c *gin.Context) string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := RoleFromContext(c)
		// admin and manager can act on any resource.
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

// CustomerOrStaff allows either: authenticated customer (role=customer) OR staff hierarchy.
// Used for order tracking endpoints where both the placing customer and staff can read.
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

// abortForbidden returns AUTH_003 with 403.
// Ref: MASTER.docx §7.
func abortForbidden(c *gin.Context) {
	c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
		"code":    "AUTH_003",
		"message": "Không đủ quyền truy cập",
	})
}
