import FilterOrigin from "./filter-origin";

type FiltersControlsCategoryProps = {
  filterOrigin: string;
  setFilterOrigin: (origin: string) => void;
};

const FiltersControlCategory = ({
  filterOrigin,
  setFilterOrigin,
}: FiltersControlsCategoryProps) => {
  return (
    <div className="sm:w-[350px] sm:mt-5 p-6">
      <FilterOrigin
        filterOrigin={filterOrigin}
        setFilterOrigin={setFilterOrigin}
      />
    </div>
  );
};

export default FiltersControlCategory;
