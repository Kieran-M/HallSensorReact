interface NumberInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  unit,
}: NumberInputProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <label className="text-sm text-slate-600">
        {label}
      </label>

      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(Number(e.target.value))
          }
          className="
            w-24

            rounded-md
            border
            border-slate-300

            bg-white

            px-2
            py-1.5

            text-right
            text-sm

            focus:outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-200
          "
        />

        {unit && (
          <span className="ml-2 text-sm text-slate-500 w-10">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}