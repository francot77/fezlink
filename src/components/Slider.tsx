type SliderProps = {
    label: string
    min: number
    max: number
    step?: number
    value: number
    unit?: string
    disabled?: boolean
    minLabel?: string
    maxLabel?: string
    onChange: (value: number) => void
    formatValue?: (value: number) => string
}

const Slider = ({
    label,
    min,
    max,
    step = 1,
    value,
    unit,
    disabled = false,
    minLabel, maxLabel,
    onChange,
    formatValue,
}: SliderProps) => {
    const displayValue = formatValue
        ? formatValue(value)
        : `${value}${unit ?? ''}`

    return (
        <div className={`space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                    {label}
                </label>
                <span className="text-sm font-semibold text-emerald-400">
                    {displayValue}
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-xs text-gray-500">
                <span>{minLabel ?? `${min}${unit ?? ''}`}</span>
                <span>{maxLabel ?? `${max}${unit ?? ''}`}</span>
            </div>
        </div>
    )
}

export default Slider
