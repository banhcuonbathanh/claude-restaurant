# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin — Staff management >> edit an existing staff member full name
- Location: tests/admin.spec.ts:42:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Updated Name')
Expected: visible
Error: strict mode violation: getByText('Updated Name') resolved to 4 elements:
    1) <td class="px-4 py-3 font-medium text-gray-900">Updated Name</td> aka getByRole('cell', { name: 'Updated Name' }).first()
    2) <td class="px-4 py-3 font-medium text-gray-900">Updated Name</td> aka getByRole('cell', { name: 'Updated Name' }).nth(1)
    3) <td class="px-4 py-3 font-medium text-gray-900">Updated Name</td> aka getByRole('cell', { name: 'Updated Name' }).nth(2)
    4) <td class="px-4 py-3 font-medium text-gray-900">Updated Name</td> aka getByRole('cell', { name: 'Updated Name' }).nth(3)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Updated Name')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - heading "Quản trị hệ thống" [level=1] [ref=e4]
      - navigation [ref=e5]:
        - link "Tổng quan" [ref=e6] [cursor=pointer]:
          - /url: /admin/overview
        - link "Tổng kết" [ref=e7] [cursor=pointer]:
          - /url: /admin/summary
        - link "Sản phẩm" [ref=e8] [cursor=pointer]:
          - /url: /admin/products
        - link "Combo" [ref=e9] [cursor=pointer]:
          - /url: /admin/combos
        - link "Danh mục" [ref=e10] [cursor=pointer]:
          - /url: /admin/categories
        - link "Topping" [ref=e11] [cursor=pointer]:
          - /url: /admin/toppings
        - link "Nhân viên" [ref=e12] [cursor=pointer]:
          - /url: /admin/staff
        - link "Kho nguyên liệu" [ref=e13] [cursor=pointer]:
          - /url: /admin/ingredients
        - link "Marketing" [ref=e14] [cursor=pointer]:
          - /url: /admin/marketing
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Nhân viên (33)" [level=2] [ref=e18]
        - button "+ Thêm nhân viên" [ref=e19] [cursor=pointer]
      - table [ref=e21]:
        - rowgroup [ref=e22]:
          - row "Tên đầy đủ Username Vai trò Trạng thái" [ref=e23]:
            - columnheader "Tên đầy đủ" [ref=e24]
            - columnheader "Username" [ref=e25]
            - columnheader "Vai trò" [ref=e26]
            - columnheader "Trạng thái" [ref=e27]
            - columnheader [ref=e28]
        - rowgroup [ref=e29]:
          - row "Updated Name e2e_chef_1778848871490 Bếp Đang hoạt động Sửa Xóa" [ref=e30]:
            - cell "Updated Name" [ref=e31]
            - cell "e2e_chef_1778848871490" [ref=e32]
            - cell "Bếp" [ref=e33]
            - cell "Đang hoạt động" [ref=e34]:
              - button "Đang hoạt động" [ref=e35] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e36]:
              - generic [ref=e37]:
                - button "Sửa" [ref=e38] [cursor=pointer]
                - button "Xóa" [ref=e39] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778848870431 Bếp Đang hoạt động Sửa Xóa" [ref=e40]:
            - cell "E2E Test Chef" [ref=e41]
            - cell "e2e_chef_1778848870431" [ref=e42]
            - cell "Bếp" [ref=e43]
            - cell "Đang hoạt động" [ref=e44]:
              - button "Đang hoạt động" [ref=e45] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e46]:
              - generic [ref=e47]:
                - button "Sửa" [ref=e48] [cursor=pointer]
                - button "Xóa" [ref=e49] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778848858303 Bếp Đang hoạt động Sửa Xóa" [ref=e50]:
            - cell "E2E Test Chef" [ref=e51]
            - cell "e2e_chef_1778848858303" [ref=e52]
            - cell "Bếp" [ref=e53]
            - cell "Đang hoạt động" [ref=e54]:
              - button "Đang hoạt động" [ref=e55] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e56]:
              - generic [ref=e57]:
                - button "Sửa" [ref=e58] [cursor=pointer]
                - button "Xóa" [ref=e59] [cursor=pointer]
          - row "Updated Name e2e_chef_1778848807571 Bếp Đang hoạt động Sửa Xóa" [ref=e60]:
            - cell "Updated Name" [ref=e61]
            - cell "e2e_chef_1778848807571" [ref=e62]
            - cell "Bếp" [ref=e63]
            - cell "Đang hoạt động" [ref=e64]:
              - button "Đang hoạt động" [ref=e65] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e66]:
              - generic [ref=e67]:
                - button "Sửa" [ref=e68] [cursor=pointer]
                - button "Xóa" [ref=e69] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778848806536 Bếp Đang hoạt động Sửa Xóa" [ref=e70]:
            - cell "E2E Test Chef" [ref=e71]
            - cell "e2e_chef_1778848806536" [ref=e72]
            - cell "Bếp" [ref=e73]
            - cell "Đang hoạt động" [ref=e74]:
              - button "Đang hoạt động" [ref=e75] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e76]:
              - generic [ref=e77]:
                - button "Sửa" [ref=e78] [cursor=pointer]
                - button "Xóa" [ref=e79] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778848795923 Bếp Đang hoạt động Sửa Xóa" [ref=e80]:
            - cell "E2E Test Chef" [ref=e81]
            - cell "e2e_chef_1778848795923" [ref=e82]
            - cell "Bếp" [ref=e83]
            - cell "Đang hoạt động" [ref=e84]:
              - button "Đang hoạt động" [ref=e85] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e86]:
              - generic [ref=e87]:
                - button "Sửa" [ref=e88] [cursor=pointer]
                - button "Xóa" [ref=e89] [cursor=pointer]
          - row "Status Toggle Test e2e_chef_1778841434870 Thu ngân Vô hiệu Sửa Xóa" [ref=e90]:
            - cell "Status Toggle Test" [ref=e91]
            - cell "e2e_chef_1778841434870" [ref=e92]
            - cell "Thu ngân" [ref=e93]
            - cell "Vô hiệu" [ref=e94]:
              - button "Vô hiệu" [ref=e95] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e96]:
              - generic [ref=e97]:
                - button "Sửa" [ref=e98] [cursor=pointer]
                - button "Xóa" [ref=e99] [cursor=pointer]
          - row "Updated Name e2e_chef_1778841433712 Bếp Đang hoạt động Sửa Xóa" [ref=e100]:
            - cell "Updated Name" [ref=e101]
            - cell "e2e_chef_1778841433712" [ref=e102]
            - cell "Bếp" [ref=e103]
            - cell "Đang hoạt động" [ref=e104]:
              - button "Đang hoạt động" [ref=e105] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e106]:
              - generic [ref=e107]:
                - button "Sửa" [ref=e108] [cursor=pointer]
                - button "Xóa" [ref=e109] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778841432553 Bếp Đang hoạt động Sửa Xóa" [ref=e110]:
            - cell "E2E Test Chef" [ref=e111]
            - cell "e2e_chef_1778841432553" [ref=e112]
            - cell "Bếp" [ref=e113]
            - cell "Đang hoạt động" [ref=e114]:
              - button "Đang hoạt động" [ref=e115] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e116]:
              - generic [ref=e117]:
                - button "Sửa" [ref=e118] [cursor=pointer]
                - button "Xóa" [ref=e119] [cursor=pointer]
          - row "Status Toggle Test e2e_chef_1778840464351 Thu ngân Vô hiệu Sửa Xóa" [ref=e120]:
            - cell "Status Toggle Test" [ref=e121]
            - cell "e2e_chef_1778840464351" [ref=e122]
            - cell "Thu ngân" [ref=e123]
            - cell "Vô hiệu" [ref=e124]:
              - button "Vô hiệu" [ref=e125] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e126]:
              - generic [ref=e127]:
                - button "Sửa" [ref=e128] [cursor=pointer]
                - button "Xóa" [ref=e129] [cursor=pointer]
          - row "Updated Name e2e_chef_1778840463221 Bếp Đang hoạt động Sửa Xóa" [ref=e130]:
            - cell "Updated Name" [ref=e131]
            - cell "e2e_chef_1778840463221" [ref=e132]
            - cell "Bếp" [ref=e133]
            - cell "Đang hoạt động" [ref=e134]:
              - button "Đang hoạt động" [ref=e135] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e136]:
              - generic [ref=e137]:
                - button "Sửa" [ref=e138] [cursor=pointer]
                - button "Xóa" [ref=e139] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778840462081 Bếp Đang hoạt động Sửa Xóa" [ref=e140]:
            - cell "E2E Test Chef" [ref=e141]
            - cell "e2e_chef_1778840462081" [ref=e142]
            - cell "Bếp" [ref=e143]
            - cell "Đang hoạt động" [ref=e144]:
              - button "Đang hoạt động" [ref=e145] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e146]:
              - generic [ref=e147]:
                - button "Sửa" [ref=e148] [cursor=pointer]
                - button "Xóa" [ref=e149] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778840449649 Bếp Đang hoạt động Sửa Xóa" [ref=e150]:
            - cell "E2E Test Chef" [ref=e151]
            - cell "e2e_chef_1778840449649" [ref=e152]
            - cell "Bếp" [ref=e153]
            - cell "Đang hoạt động" [ref=e154]:
              - button "Đang hoạt động" [ref=e155] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e156]:
              - generic [ref=e157]:
                - button "Sửa" [ref=e158] [cursor=pointer]
                - button "Xóa" [ref=e159] [cursor=pointer]
          - row "Original Name e2e_chef_1778839423818 Bếp Đang hoạt động Sửa Xóa" [ref=e160]:
            - cell "Original Name" [ref=e161]
            - cell "e2e_chef_1778839423818" [ref=e162]
            - cell "Bếp" [ref=e163]
            - cell "Đang hoạt động" [ref=e164]:
              - button "Đang hoạt động" [ref=e165] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e166]:
              - generic [ref=e167]:
                - button "Sửa" [ref=e168] [cursor=pointer]
                - button "Xóa" [ref=e169] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778839422784 Bếp Đang hoạt động Sửa Xóa" [ref=e170]:
            - cell "E2E Test Chef" [ref=e171]
            - cell "e2e_chef_1778839422784" [ref=e172]
            - cell "Bếp" [ref=e173]
            - cell "Đang hoạt động" [ref=e174]:
              - button "Đang hoạt động" [ref=e175] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e176]:
              - generic [ref=e177]:
                - button "Sửa" [ref=e178] [cursor=pointer]
                - button "Xóa" [ref=e179] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778839410221 Bếp Đang hoạt động Sửa Xóa" [ref=e180]:
            - cell "E2E Test Chef" [ref=e181]
            - cell "e2e_chef_1778839410221" [ref=e182]
            - cell "Bếp" [ref=e183]
            - cell "Đang hoạt động" [ref=e184]:
              - button "Đang hoạt động" [ref=e185] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e186]:
              - generic [ref=e187]:
                - button "Sửa" [ref=e188] [cursor=pointer]
                - button "Xóa" [ref=e189] [cursor=pointer]
          - row "Original Name e2e_chef_1778839102634 Bếp Đang hoạt động Sửa Xóa" [ref=e190]:
            - cell "Original Name" [ref=e191]
            - cell "e2e_chef_1778839102634" [ref=e192]
            - cell "Bếp" [ref=e193]
            - cell "Đang hoạt động" [ref=e194]:
              - button "Đang hoạt động" [ref=e195] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e196]:
              - generic [ref=e197]:
                - button "Sửa" [ref=e198] [cursor=pointer]
                - button "Xóa" [ref=e199] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778839090085 Bếp Đang hoạt động Sửa Xóa" [ref=e200]:
            - cell "E2E Test Chef" [ref=e201]
            - cell "e2e_chef_1778839090085" [ref=e202]
            - cell "Bếp" [ref=e203]
            - cell "Đang hoạt động" [ref=e204]:
              - button "Đang hoạt động" [ref=e205] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e206]:
              - generic [ref=e207]:
                - button "Sửa" [ref=e208] [cursor=pointer]
                - button "Xóa" [ref=e209] [cursor=pointer]
          - row "Original Name e2e_chef_1778838801256 Bếp Đang hoạt động Sửa Xóa" [ref=e210]:
            - cell "Original Name" [ref=e211]
            - cell "e2e_chef_1778838801256" [ref=e212]
            - cell "Bếp" [ref=e213]
            - cell "Đang hoạt động" [ref=e214]:
              - button "Đang hoạt động" [ref=e215] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e216]:
              - generic [ref=e217]:
                - button "Sửa" [ref=e218] [cursor=pointer]
                - button "Xóa" [ref=e219] [cursor=pointer]
          - row "Original Name e2e_chef_1778838784378 Bếp Đang hoạt động Sửa Xóa" [ref=e220]:
            - cell "Original Name" [ref=e221]
            - cell "e2e_chef_1778838784378" [ref=e222]
            - cell "Bếp" [ref=e223]
            - cell "Đang hoạt động" [ref=e224]:
              - button "Đang hoạt động" [ref=e225] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e226]:
              - generic [ref=e227]:
                - button "Sửa" [ref=e228] [cursor=pointer]
                - button "Xóa" [ref=e229] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778838783084 Bếp Đang hoạt động Sửa Xóa" [ref=e230]:
            - cell "E2E Test Chef" [ref=e231]
            - cell "e2e_chef_1778838783084" [ref=e232]
            - cell "Bếp" [ref=e233]
            - cell "Đang hoạt động" [ref=e234]:
              - button "Đang hoạt động" [ref=e235] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e236]:
              - generic [ref=e237]:
                - button "Sửa" [ref=e238] [cursor=pointer]
                - button "Xóa" [ref=e239] [cursor=pointer]
          - row "Original Name e2e_chef_1778829398955 Bếp Đang hoạt động Sửa Xóa" [ref=e240]:
            - cell "Original Name" [ref=e241]
            - cell "e2e_chef_1778829398955" [ref=e242]
            - cell "Bếp" [ref=e243]
            - cell "Đang hoạt động" [ref=e244]:
              - button "Đang hoạt động" [ref=e245] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e246]:
              - generic [ref=e247]:
                - button "Sửa" [ref=e248] [cursor=pointer]
                - button "Xóa" [ref=e249] [cursor=pointer]
          - row "Original Name e2e_chef_1778829382079 Bếp Đang hoạt động Sửa Xóa" [ref=e250]:
            - cell "Original Name" [ref=e251]
            - cell "e2e_chef_1778829382079" [ref=e252]
            - cell "Bếp" [ref=e253]
            - cell "Đang hoạt động" [ref=e254]:
              - button "Đang hoạt động" [ref=e255] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e256]:
              - generic [ref=e257]:
                - button "Sửa" [ref=e258] [cursor=pointer]
                - button "Xóa" [ref=e259] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778829381015 Bếp Đang hoạt động Sửa Xóa" [ref=e260]:
            - cell "E2E Test Chef" [ref=e261]
            - cell "e2e_chef_1778829381015" [ref=e262]
            - cell "Bếp" [ref=e263]
            - cell "Đang hoạt động" [ref=e264]:
              - button "Đang hoạt động" [ref=e265] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e266]:
              - generic [ref=e267]:
                - button "Sửa" [ref=e268] [cursor=pointer]
                - button "Xóa" [ref=e269] [cursor=pointer]
          - row "Original Name e2e_chef_1778828536407 Bếp Đang hoạt động Sửa Xóa" [ref=e270]:
            - cell "Original Name" [ref=e271]
            - cell "e2e_chef_1778828536407" [ref=e272]
            - cell "Bếp" [ref=e273]
            - cell "Đang hoạt động" [ref=e274]:
              - button "Đang hoạt động" [ref=e275] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e276]:
              - generic [ref=e277]:
                - button "Sửa" [ref=e278] [cursor=pointer]
                - button "Xóa" [ref=e279] [cursor=pointer]
          - row "E2E Test Chef e2e_chef_1778828525438 Bếp Đang hoạt động Sửa Xóa" [ref=e280]:
            - cell "E2E Test Chef" [ref=e281]
            - cell "e2e_chef_1778828525438" [ref=e282]
            - cell "Bếp" [ref=e283]
            - cell "Đang hoạt động" [ref=e284]:
              - button "Đang hoạt động" [ref=e285] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e286]:
              - generic [ref=e287]:
                - button "Sửa" [ref=e288] [cursor=pointer]
                - button "Xóa" [ref=e289] [cursor=pointer]
          - row "Pháº¡m Thu NgÃ¢n cashier1 Thu ngân Đang hoạt động Sửa Xóa" [ref=e290]:
            - cell "Pháº¡m Thu NgÃ¢n" [ref=e291]
            - cell "cashier1" [ref=e292]
            - cell "Thu ngân" [ref=e293]
            - cell "Đang hoạt động" [ref=e294]:
              - button "Đang hoạt động" [ref=e295] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e296]:
              - generic [ref=e297]:
                - button "Sửa" [ref=e298] [cursor=pointer]
                - button "Xóa" [ref=e299] [cursor=pointer]
          - 'row "LÃª Äáº§u Báº¿p chef1 Bếp Đang hoạt động Sửa Xóa" [ref=e300]':
            - 'cell "LÃª Äáº§u Báº¿p" [ref=e301]'
            - cell "chef1" [ref=e302]
            - cell "Bếp" [ref=e303]
            - cell "Đang hoạt động" [ref=e304]:
              - button "Đang hoạt động" [ref=e305] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e306]:
              - generic [ref=e307]:
                - button "Sửa" [ref=e308] [cursor=pointer]
                - button "Xóa" [ref=e309] [cursor=pointer]
          - row "Tráº§n Quáº£n LÃ½ manager1 Quản lý Đang hoạt động Sửa Xóa" [ref=e310]:
            - cell "Tráº§n Quáº£n LÃ½" [ref=e311]
            - cell "manager1" [ref=e312]
            - cell "Quản lý" [ref=e313]
            - cell "Đang hoạt động" [ref=e314]:
              - button "Đang hoạt động" [ref=e315] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e316]:
              - generic [ref=e317]:
                - button "Sửa" [ref=e318] [cursor=pointer]
                - button "Xóa" [ref=e319] [cursor=pointer]
          - row "Lê Văn Phục staff_demo01 Nhân viên Đang hoạt động Sửa Xóa" [ref=e320]:
            - cell "Lê Văn Phục" [ref=e321]
            - cell "staff_demo01" [ref=e322]
            - cell "Nhân viên" [ref=e323]
            - cell "Đang hoạt động" [ref=e324]:
              - button "Đang hoạt động" [ref=e325] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e326]:
              - generic [ref=e327]:
                - button "Sửa" [ref=e328] [cursor=pointer]
                - button "Xóa" [ref=e329] [cursor=pointer]
          - row "Trần Thị Thu cashier01 Thu ngân Đang hoạt động Sửa Xóa" [ref=e330]:
            - cell "Trần Thị Thu" [ref=e331]
            - cell "cashier01" [ref=e332]
            - cell "Thu ngân" [ref=e333]
            - cell "Đang hoạt động" [ref=e334]:
              - button "Đang hoạt động" [ref=e335] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e336]:
              - generic [ref=e337]:
                - button "Sửa" [ref=e338] [cursor=pointer]
                - button "Xóa" [ref=e339] [cursor=pointer]
          - row "Nguyễn Văn Bếp chef_demo01 Bếp Đang hoạt động Sửa Xóa" [ref=e340]:
            - cell "Nguyễn Văn Bếp" [ref=e341]
            - cell "chef_demo01" [ref=e342]
            - cell "Bếp" [ref=e343]
            - cell "Đang hoạt động" [ref=e344]:
              - button "Đang hoạt động" [ref=e345] [cursor=pointer]
            - cell "Sửa Xóa" [ref=e346]:
              - generic [ref=e347]:
                - button "Sửa" [ref=e348] [cursor=pointer]
                - button "Xóa" [ref=e349] [cursor=pointer]
          - row "Admin admin Admin Đang hoạt động Sửa" [ref=e350]:
            - cell "Admin" [ref=e351]
            - cell "admin" [ref=e352]
            - cell "Admin" [ref=e353]
            - cell "Đang hoạt động" [ref=e354]:
              - button "Đang hoạt động" [disabled] [ref=e355]
            - cell "Sửa" [ref=e356]:
              - button "Sửa" [ref=e358] [cursor=pointer]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e359]:
        - img [ref=e361]
        - generic [ref=e364]: Đã cập nhật nhân viên
      - listitem [ref=e365]:
        - img [ref=e367]
        - generic [ref=e370]: Đã tạo tài khoản nhân viên
  - alert [ref=e371]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loginAs } from '../fixtures/auth'
  3  | 
  4  | /**
  5  |  * Flow 3: Admin creates a staff member, edits it, and toggles status.
  6  |  * Uses a timestamp-based username to avoid collisions across test runs.
  7  |  * Requires: docker compose up -d + seed data applied.
  8  |  */
  9  | test.describe.configure({ mode: 'serial' })
  10 | 
  11 | test.describe('Admin — Staff management', () => {
  12 |   test.beforeEach(async ({ page }) => {
  13 |     await loginAs(page, 'admin')
  14 |     await page.goto('/admin/staff')
  15 |     await expect(page.getByRole('heading', { name: /Nhân viên/i })).toBeVisible({ timeout: 10_000 })
  16 |   })
  17 | 
  18 |   test('create a new staff member', async ({ page }) => {
  19 |     const username = `e2e_chef_${Date.now()}`
  20 |     // Open modal
  21 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  22 |     await expect(page.getByRole('heading', { name: 'Thêm nhân viên' })).toBeVisible()
  23 | 
  24 |     // Fill form
  25 |     await page.getByPlaceholder('chef_an').fill(username)
  26 |     await page.locator('input[type="password"]').fill('E2eTest1')
  27 |     await page.getByPlaceholder('Nguyễn Văn An').fill('E2E Test Chef')
  28 | 
  29 |     // Select role: pick "Bếp" from the select
  30 |     await page.locator('select').selectOption('chef')
  31 | 
  32 |     // Submit
  33 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  34 | 
  35 |     // Success toast
  36 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  37 | 
  38 |     // New staff row appears in the table
  39 |     await expect(page.getByText(username)).toBeVisible({ timeout: 5_000 })
  40 |   })
  41 | 
  42 |   test('edit an existing staff member full name', async ({ page }) => {
  43 |     const username = `e2e_chef_${Date.now()}`
  44 |     // Create first, then edit
  45 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  46 |     await page.getByPlaceholder('chef_an').fill(username)
  47 |     await page.locator('input[type="password"]').fill('E2eTest1')
  48 |     await page.getByPlaceholder('Nguyễn Văn An').fill('Original Name')
  49 |     await page.locator('select').selectOption('chef')
  50 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  51 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  52 | 
  53 |     // Find the row for the new staff and click "Sửa"
  54 |     const row = page.locator('tr').filter({ hasText: username })
  55 |     await expect(row).toBeVisible({ timeout: 5_000 })
  56 |     await row.getByRole('button', { name: 'Sửa' }).click()
  57 | 
  58 |     // Edit modal heading includes the username
  59 |     await expect(page.getByText(`Sửa nhân viên — ${username}`)).toBeVisible()
  60 |     // Edit modal's full_name input has no placeholder; scope to the form via the "Lưu" button's ancestor
  61 |     const editForm = page.getByRole('button', { name: 'Lưu' }).locator('xpath=ancestor::form')
  62 |     const nameInput = editForm.getByRole('textbox').first()
  63 |     await nameInput.clear()
  64 |     await nameInput.fill('Updated Name')
  65 |     await page.getByRole('button', { name: 'Lưu' }).click()
  66 | 
  67 |     // Success toast
  68 |     await expect(page.getByText('Đã cập nhật nhân viên')).toBeVisible({ timeout: 8_000 })
  69 | 
  70 |     // Updated name in table
> 71 |     await expect(page.getByText('Updated Name')).toBeVisible()
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  72 |   })
  73 | 
  74 |   test('toggle staff active status', async ({ page }) => {
  75 |     const username = `e2e_chef_${Date.now()}`
  76 |     // Create a staff member to toggle
  77 |     await page.getByRole('button', { name: '+ Thêm nhân viên' }).click()
  78 |     await page.getByPlaceholder('chef_an').fill(username)
  79 |     await page.locator('input[type="password"]').fill('E2eTest1')
  80 |     await page.getByPlaceholder('Nguyễn Văn An').fill('Status Toggle Test')
  81 |     await page.locator('select').selectOption('cashier')
  82 |     await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  83 |     await expect(page.getByText('Đã tạo tài khoản nhân viên')).toBeVisible({ timeout: 8_000 })
  84 | 
  85 |     // Find the new staff row and click its status toggle (shows "Đang hoạt động")
  86 |     const row = page.locator('tr').filter({ hasText: username })
  87 |     await expect(row).toBeVisible({ timeout: 5_000 })
  88 |     const statusBtn = row.getByRole('button', { name: 'Đang hoạt động' })
  89 |     await expect(statusBtn).toBeVisible()
  90 |     await statusBtn.click()
  91 | 
  92 |     // Toast confirms update
  93 |     await expect(page.getByText('Đã cập nhật trạng thái')).toBeVisible({ timeout: 8_000 })
  94 | 
  95 |     // Status button now shows "Vô hiệu"
  96 |     await expect(row.getByRole('button', { name: 'Vô hiệu' })).toBeVisible()
  97 |   })
  98 | })
  99 | 
```