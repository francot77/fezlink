type CompactSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const CompactSlider = ({
  label,
  min,
  max,
  step = 1,
  value,
  unit = '',
  disabled = false,
  onChange,
}: CompactSliderProps) => {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-xs font-bold text-emerald-400">
          {value}
          {unit}
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
        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer compact-slider-thumb"
      />
      <style jsx>{`
        .compact-slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
          transition: all 0.2s;
        }

        .compact-slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 3px 8px rgba(16, 185, 129, 0.6);
        }

        .compact-slider-thumb::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
          transition: all 0.2s;
        }

        .compact-slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 3px 8px rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};

export default CompactSlider;
