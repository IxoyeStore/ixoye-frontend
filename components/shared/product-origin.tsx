interface ProductOriginProps {
  origin: string;
}

const ProductOrigin = (props: ProductOriginProps) => {
  const { origin } = props;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="px-2 py-1 text-white bg-black rounded-full dark:bg-white dark:text-black w-fit">
        {origin}
      </p>
    </div>
  );
};

export default ProductOrigin;
