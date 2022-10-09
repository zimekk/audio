import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { createAsset } from "use-asset";
import { z } from "zod";

const config = createAsset(async () =>
  z
    .record(
      z
        .object({
          logo: z.string(),
          name: z.string(),
          url: z.string(),
        })
        .array()
    )
    .parseAsync((await import("./config")).stations)
);

function Filters({
  options,
  filters,
  setFilters,
}: {
  options: any;
  filters: any;
  setFilters: any;
}) {
  return (
    <fieldset>
      <label>
        <span>Country</span>
        <select
          value={filters.country}
          onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                country: target.value,
              })),
            []
          )}
        >
          {options.country.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Search</span>
        <input
          type="search"
          value={filters.search}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                search: target.value,
              })),
            []
          )}
        />
      </label>
    </fieldset>
  );
}

export default function Stations() {
  const stations = config.read();

  const options = useMemo(
    () => ({
      country: Object.keys(stations),
    }),
    [stations]
  );

  const [filters, setFilters] = useState(() => ({
    country: "poland",
    search: "",
  }));

  const [queries, setQueries] = useState(() => filters);

  const search$ = useMemo(() => new Subject<any>(), []);

  useEffect(() => {
    const subscription = search$
      .pipe(
        map(({ search, ...filters }) =>
          JSON.stringify({
            ...queries,
            ...filters,
            search: search.toLowerCase().trim(),
          })
        ),
        distinctUntilChanged(),
        debounceTime(400)
      )
      .subscribe((filters) =>
        setQueries((queries) => ({ ...queries, ...JSON.parse(filters) }))
      );
    return () => subscription.unsubscribe();
  }, [search$]);

  useEffect(() => {
    search$.next(filters);
  }, [filters]);

  console.log({ filters, stations, queries });

  return (
    <div>
      <h3>Stations</h3>
      <Filters options={options} filters={filters} setFilters={setFilters} />
      <ul>
        {useMemo(
          () =>
            stations[filters.country].filter(
              (item) =>
                queries.search === "" ||
                item.name.toLowerCase().match(queries.search)
            ),
          [filters, queries, stations]
        ).map(({ logo, name, url }) => (
          <li key={url}>
            <img
              src={`https://raw.githubusercontent.com/Koenvh1/ets2-local-radio/master/web/${encodeURIComponent(
                logo
              )}`}
            />
            <a href={url} rel="noopener noreferrer" target="_blank">
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
