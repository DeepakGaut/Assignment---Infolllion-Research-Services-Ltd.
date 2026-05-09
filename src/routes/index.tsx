import { createFileRoute } from "@tanstack/react-router";
import { TreeVisualizer } from "@/components/TreeVisualizer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <TreeVisualizer />;
}
