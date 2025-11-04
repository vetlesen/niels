import { getWork } from "../queries/getWork";
import Work from "../components/Work";
import Filter from "../components/Filter";
import FilterContext from "../components/FilterContext";

export default async function Home() {
  const work = await getWork();

  return (
    <main>
      <FilterContext>
        <Filter />
        <Work work={work} />
      </FilterContext>
    </main>
  );
}
