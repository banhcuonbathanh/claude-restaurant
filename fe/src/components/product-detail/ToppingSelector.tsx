import { formatVND } from '@/lib/utils'
import type { Topping } from '@/types/product'

interface ToppingSelectorProps {
  toppings: Topping[]
  selected: string[]
  basePrice: number
  onChange: (ids: string[]) => void
}

export function ToppingSelector({ toppings, selected, basePrice, onChange }: ToppingSelectorProps) {
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    )
  }

  const selectedToppings = toppings.filter(t => selected.includes(t.id))
  const toppingSum = selectedToppings.reduce((s, t) => s + t.price, 0)

  return (
    <div className="px-4 pt-4 flex flex-col gap-3 border-t border-border">
      <h2 className="text-sm font-semibold text-foreground">
        Chọn topping <span className="font-normal text-muted-fg">(chọn nhiều · thêm vào giá)</span>
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {toppings.map(topping => {
          const isSelected = selected.includes(topping.id)
          return (
            <label
              key={topping.id}
              className={[
                'flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-colors min-h-[44px]',
                !topping.is_available ? 'opacity-50 cursor-not-allowed' : '',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(topping.id)}
                  disabled={!topping.is_available}
                  className="w-4 h-4 accent-primary flex-shrink-0"
                />
                <span className="text-xs font-medium text-foreground leading-snug">
                  {topping.name}
                </span>
              </div>
              <span className="text-xs text-primary font-semibold pl-6">
                +{formatVND(topping.price)}
              </span>
            </label>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-fg pt-1 border-t border-border">
          Tổng: {formatVND(basePrice)} + {formatVND(toppingSum)} ={' '}
          <span className="text-primary font-semibold">{formatVND(basePrice + toppingSum)}</span>
        </p>
      )}
    </div>
  )
}
