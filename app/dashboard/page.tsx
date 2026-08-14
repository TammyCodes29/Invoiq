import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  {
    title: "Total clients",
    value: "0",
    description: "No clients added yet",
  },
  {
    title: "Outstanding",
    value: "₦0",
    description: "No unpaid invoices",
  },
  {
    title: "Total revenue",
    value: "₦0",
    description: "No payments received",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          An overview of your clients, invoices, and revenue.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="border-zinc-800 bg-zinc-900/60 text-white"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {metric.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold">
                {metric.value}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}