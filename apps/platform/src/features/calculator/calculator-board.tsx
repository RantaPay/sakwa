"use client";

import { Button, Field, Input, Select } from "@sakwa/ui";
import { formatNaira, lagosToday, nairaToKobo } from "@sakwa/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { HouseCapitalForm } from "@/features/investments/house-capital-form";
import { useAuthUser } from "@/lib/use-auth-user";
import {
  loadCalculatorBase,
  saveEntries,
  saveKgPerBag,
  saveLayout,
  saveStoreRate,
} from "./data";
import { buildEntry, Report, SheetUpload, type EntryDraft } from "./sheet-upload";

export function CalculatorBoard() {
  const client = useQueryClient();
  const { data: user } = useAuthUser();
  const query = useQuery({ queryKey: ["calculator"], queryFn: loadCalculatorBase });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const base = query.data;
  const stores = base?.stores ?? [];
  const kgPerBag = base?.kgPerBag ?? 50;

  async function refresh() {
    await client.invalidateQueries({ queryKey: ["calculator"] });
  }

  return (
    <div className="space-y-6">
      <PageHeading
        mark="calculator"
        title="Calculator"
        body="Set the kilograms in a bag and each store's buying and selling rate. Typed figures and uploaded sheets use those rules."
      />
      {query.isLoading ? <p className="text-muted">Reading the calculator.</p> : null}
      {query.isError ? (
        <p className="text-danger">The calculator could not be read.</p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {base && user ? (
        <>
          <Parameters
            kgPerBag={kgPerBag}
            onSave={async (kg) => {
              setError("");
              await saveKgPerBag(kg, user.id);
              setMessage("Kilograms per bag saved.");
              await refresh();
            }}
          />
          <HouseCapitalForm />
          <StoreRates
            stores={stores}
            prices={base.storePrices}
            onSave={async (input) => {
              setError("");
              await saveStoreRate({ ...input, userId: user.id });
              setMessage("Store rate saved.");
              await refresh();
            }}
          />
          <ManualEntry
            stores={stores}
            kgPerBag={kgPerBag}
            house={base.housePrices}
            storePrices={base.storePrices}
            onSave={async (row) => {
              const result = await saveEntries([row], user.id);
              setMessage(
                result.skipped ? "That line is already in the books." : "Line saved.",
              );
              await refresh();
            }}
          />
          <SheetUpload
            stores={stores}
            kgPerBag={kgPerBag}
            house={base.housePrices}
            storePrices={base.storePrices}
            onSave={async (rows, signature, mapping) => {
              const result = await saveEntries(rows, user.id);
              if (signature) await saveLayout(signature, mapping);
              setMessage(
                `${result.added} rows added. ${result.skipped} already in the books.`,
              );
              await refresh();
            }}
          />
          <Report entries={base.entries} stores={stores} />
        </>
      ) : null}
    </div>
  );
}

function Parameters({
  kgPerBag,
  onSave,
}: {
  kgPerBag: number;
  onSave: (kg: number) => Promise<void>;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="rounded-[1.75rem] border border-border bg-surface p-5"
      action={async (formData) => {
        const kg = Number(formData.get("kg"));
        if (!(kg > 0)) {
          setError("Enter the kilograms in one bag.");
          return;
        }
        setError("");
        await onSave(kg);
      }}
    >
      <h2 className="text-xl font-semibold">Rule</h2>
      <p className="mt-1 text-sm text-muted">
        Sales are kilograms sold times the selling rate. Expense is kilograms bought times
        the buying rate. If only a sale is entered, the same kilograms are costed at the
        buying rate. Profit is sales minus expense.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Field label="Kilograms in one bag" htmlFor="kg">
          <Input id="kg" name="kg" inputMode="decimal" defaultValue={String(kgPerBag)} />
        </Field>
        <Button type="submit">Save rule</Button>
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </form>
  );
}

function StoreRates({
  stores,
  prices,
  onSave,
}: {
  stores: { id: string; name: string }[];
  prices: {
    warehouse_id: string;
    buying_price_per_kg_kobo: number;
    selling_price_per_kg_kobo: number;
    effective_on: string;
  }[];
  onSave: (input: {
    warehouseId: string;
    buyingKobo: number;
    sellingKobo: number;
    effectiveOn: string;
  }) => Promise<void>;
}) {
  const [error, setError] = useState("");
  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Store rates</h2>
      <p className="mt-1 text-sm text-muted">
        A store with no rate of its own uses the house buying and selling price.
      </p>
      <form
        className="mt-4 grid gap-3 md:grid-cols-4"
        action={async (formData) => {
          const buying = Number(nairaToKobo(String(formData.get("buying") ?? "")));
          const selling = Number(nairaToKobo(String(formData.get("selling") ?? "")));
          if (!(buying > 0) || !(selling > 0)) {
            setError("Enter both rates.");
            return;
          }
          setError("");
          await onSave({
            warehouseId: String(formData.get("store")),
            buyingKobo: buying,
            sellingKobo: selling,
            effectiveOn: String(formData.get("day")),
          });
        }}
      >
        <Field label="Store" htmlFor="rate-store">
          <Select id="rate-store" name="store" required>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Buying per kg" htmlFor="buying">
          <Input id="buying" name="buying" inputMode="numeric" required />
        </Field>
        <Field label="Selling per kg" htmlFor="selling">
          <Input id="selling" name="selling" inputMode="numeric" required />
        </Field>
        <Field label="From" htmlFor="day">
          <Input id="day" name="day" type="date" required defaultValue={lagosToday()} />
        </Field>
        <Button type="submit">Save rate</Button>
      </form>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ul className="mt-4 divide-y divide-border">
        {prices.map((row) => (
          <li
            key={`${row.warehouse_id}-${row.effective_on}`}
            className="flex flex-wrap justify-between gap-2 py-2 text-sm"
          >
            <span>
              {stores.find((store) => store.id === row.warehouse_id)?.name ?? "Store"} ·{" "}
              {row.effective_on}
            </span>
            <span>
              Buy {formatNaira(row.buying_price_per_kg_kobo)} · Sell{" "}
              {formatNaira(row.selling_price_per_kg_kobo)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ManualEntry({
  stores,
  kgPerBag,
  house,
  storePrices,
  onSave,
}: {
  stores: { id: string; name: string }[];
  kgPerBag: number;
  house: {
    effective_on: string;
    buying_price_per_kg_kobo: number;
    selling_price_per_kg_kobo: number;
    created_at?: string;
  }[];
  storePrices: {
    warehouse_id: string;
    effective_on: string;
    buying_price_per_kg_kobo: number;
    selling_price_per_kg_kobo: number;
    created_at?: string;
  }[];
  onSave: (row: EntryDraft) => Promise<void>;
}) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="rounded-[1.75rem] border border-border bg-surface p-5"
      action={async (formData) => {
        const built = buildEntry(formData, kgPerBag, house, storePrices, "manual");
        if ("error" in built) {
          setError(built.error);
          setPreview("");
          return;
        }
        setError("");
        setPreview(
          `Sales ${formatNaira(built.salesKobo)} · Expense ${formatNaira(built.expenseKobo)} · Profit ${formatNaira(built.profitKobo)}`,
        );
        await onSave(built);
      }}
    >
      <h2 className="text-xl font-semibold">Enter figures</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Store" htmlFor="entry-store">
          <Select id="entry-store" name="store" required>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date" htmlFor="entry-day">
          <Input
            id="entry-day"
            name="day"
            type="date"
            required
            defaultValue={lagosToday()}
          />
        </Field>
        <Field label="Bags sold" htmlFor="bags-sold">
          <Input id="bags-sold" name="bagsSold" inputMode="numeric" />
        </Field>
        <Field label="Kg sold" htmlFor="kg-sold">
          <Input id="kg-sold" name="kgSold" inputMode="decimal" />
        </Field>
        <Field label="Bags bought" htmlFor="bags-bought">
          <Input id="bags-bought" name="bagsBought" inputMode="numeric" />
        </Field>
        <Field label="Kg bought" htmlFor="kg-bought">
          <Input id="kg-bought" name="kgBought" inputMode="decimal" />
        </Field>
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      {preview ? <p className="mt-2 text-sm font-semibold">{preview}</p> : null}
      <Button className="mt-4" type="submit">
        Save line
      </Button>
    </form>
  );
}
