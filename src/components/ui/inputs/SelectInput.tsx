type SelectOption = {
  value: any;
  label: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
};

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <label className="text-sm text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          w-32

          rounded-md
          border
          border-slate-300

          bg-white

          px-2
          py-1.5

          text-sm

          focus:outline-none
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
        "
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}