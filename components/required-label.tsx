interface RequiredLabelProps {
  children: React.ReactNode;
}

export function RequiredLabel({ children }: RequiredLabelProps) {
  return (
    <label className="text-sm font-medium">
      {children} <span className="text-destructive">*</span>
    </label>
  );
}
