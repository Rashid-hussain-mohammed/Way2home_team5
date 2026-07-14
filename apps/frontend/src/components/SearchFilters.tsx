import React, { useEffect, useState, type MutableRefObject } from "react";
import { PropertyType } from "./addListing";
import { FaCheck, FaTimes } from "react-icons/fa";


export type SearchFilters = {
  minPrice?: number
  maxPrice?: number
  location?: string
  propertyType?: PropertyType
  arePetsAllowed?: boolean
  availabilityFrom?: Date
  availabilityTo?: Date
  minSize?: number
  maxSize?: number
}

type Props = {
  onChange: (filters: SearchFilters) => void
  onReset: () => void
  onApplyFilters: () => void
  setFiltersRef: MutableRefObject<(filters: SearchFilters) => void>
}

function humanize(value: string): string {
  return value.replaceAll(/([a-z])([A-Z])/g, "$1 $2")
}


const SearchFiltersComponent: React.FC<Props> = ({ onChange, onReset, onApplyFilters, setFiltersRef }) => {
  const [filters, setFilters] = useState<SearchFilters>({})

  const onPropertyChange = <T extends keyof SearchFilters>(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: T,
    parse: (e: string) => SearchFilters[T]) =>
  {
    let value: SearchFilters[T] = undefined
    if (event.target.value !== "")
      value = parse(event.target.value)
    setFilters({
      ...filters,
      [key]: value
    })
  }

  const reset = () => {
    setFilters({})
    onReset()
  }

  useEffect(() => {
    onChange(filters)
  }, [filters, onChange])

  useEffect(() => {
    setFiltersRef.current = (filters: SearchFilters) => {
      console.log(filters)
      const form = document.querySelector(".sf-form")!
      for (const [key, value] of Object.entries(filters)) {
        console.log(key, value)
        const input = form.querySelector<any>(`[name=${key}]`)!
        if (typeof value == "number")
          input.value = value
        else if (typeof value == "string" || typeof value == "boolean")
          input.value = value.toString()
        else if (!value)
          continue
        else if (value instanceof Date)
          input.value = value.toISOString().split("T")[0]
        else
          console.error("unhandled:", key, value)
      }
    }
  }, [setFiltersRef.current])

  return (
    <form className="grid items-end grid-cols-10 gap-4 mt-6 sf-form">
      <div className="col-span-10 md:col-span-4">
        <label className="block mb-2 font-medium text-gray-700">
          Location
          <input
            name="location"
            type="text"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "location", e => e)}
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-2">
        <label className="block mb-2 font-medium text-gray-700">
          Property Type
          <select
            name="propertyType"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "propertyType", e => e as PropertyType)}
          >
            <option key="" value="">Select...</option>
            {Object.values(PropertyType).map(type => {
                return <option key={type} value={type}>{humanize(type)}</option>
            })}
          </select>
        </label>
      </div>

      <div className="col-span-10 md:col-span-1">
        <label className="block mb-2 font-medium text-gray-700">
          Min. Rent
          <input
            name="minPrice"
            type="number"
            min="0"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "minPrice", parseInt)}
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-1">
        <label className="block mb-2 font-medium text-gray-700">
          Max. Rent
          <input
            name="maxPrice"
            type="number"
            min="1"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "maxPrice", parseInt)}
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-1">
        <label className="block mb-2 font-medium text-gray-700">
          Min. Size
          <input
            name="minSize"
            type="number"
            min="0"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "minSize", parseInt)}
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-1">
        <label className="block mb-2 font-medium text-gray-700">
          Max. Size
          <input
            name="maxSize"
            type="number"
            min="1"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "maxSize", parseInt)}
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-2">
        <label className="block mb-2 font-medium text-gray-700">
          Available from
          <input
            name="availabilityFrom"
            type="date"
            onChange={e => onPropertyChange(e, "availabilityFrom", e => new Date(e))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-2">
        <label className="block mb-2 font-medium text-gray-700">
          Available to
          <input
            name="availabilityTo"
            type="date"
            onChange={e => onPropertyChange(e, "availabilityTo", e => new Date(e))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </label>
      </div>

      <div className="col-span-10 md:col-span-2">
        <label className="block mb-2 font-medium text-gray-700">
          Pets...
          <select
            name="arePetsAllowed"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            onChange={e => onPropertyChange(e, "arePetsAllowed", e => e === "true")}
          >
            <option value="">Select...</option>
            <option value="true">allowed</option>
            <option value="false">not allowed</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        className="col-span-10 md:col-start-9 md:col-end-9 px-4 py-2 text-white bg-black rounded-md hover:bg-yellow-600 flex justify-between items-center gap-2"
        onClick={onApplyFilters}
      >
        Apply <FaCheck color="green" />
      </button>

      <button
        type="reset"
        className="col-span-10 md:col-start-10 md:col-end-10 px-4 py-2 text-white bg-black rounded-md hover:bg-yellow-600 flex justify-between items-center gap-2"
        onClick={reset}
      >
        Clear <FaTimes color="darkred" />
      </button>
    </form>
  );
}
export default SearchFiltersComponent;
