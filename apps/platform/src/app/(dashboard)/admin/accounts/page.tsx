import { ROLE_LABEL, ROLES } from "@sakwa/types";
import { PageHeading } from "@/components/page-heading";
import { listAccounts } from "@/features/accounts/accounts";

export default async function AccountsPage() {
  const accounts = await listAccounts();

  return (
    <div>
      <PageHeading
        mark="people"
        title="Accounts"
        body="Open any account with one click. You leave your admin session and sign in as that person. Sign in as admin again to come back here."
      />
      <div className="grid gap-5">
        {ROLES.map((role) => {
          const people = accounts.filter((row) => row.role === role);
          return (
            <section
              key={role}
              className="rounded-[1.75rem] border border-border bg-surface p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold">{ROLE_LABEL[role]}</h2>
                <p className="text-sm text-muted">{people.length}</p>
              </div>
              {people.length === 0 ? (
                <p className="mt-3 text-sm text-muted">
                  No {ROLE_LABEL[role].toLowerCase()} account yet. Create one under
                  People.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {people.map((person) => (
                    <li
                      key={person.id}
                      className="flex flex-col rounded-2xl border border-border p-4"
                    >
                      <p className="font-semibold">{person.fullName}</p>
                      <p className="text-sm text-muted">{person.email}</p>
                      <p className="text-sm text-muted">
                        {person.active ? person.phone || "No phone" : "Closed"}
                      </p>
                      <form action="/api/accounts/enter" method="post" className="mt-4">
                        <input type="hidden" name="userId" value={person.id} />
                        <button
                          type="submit"
                          disabled={!person.active}
                          className="inline-flex min-h-12 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        >
                          Open
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
