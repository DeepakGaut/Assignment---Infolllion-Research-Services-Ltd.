import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TreeNode = {
  id: string;
  label: string;
  children: TreeNode[];
};

const initialTree: TreeNode = {
  id: "root",
  label: "Root",
  children: [
    {
      id: "a",
      label: "Child 1",
      children: [
        { id: "a1", label: "New Node", children: [] },
        { id: "a2", label: "New Node", children: [] },
        {
          id: "a3",
          label: "New Node",
          children: [{ id: "a3-1", label: "New Node", children: [] }],
        },
      ],
    },
    {
      id: "b",
      label: "Child 2",
      children: [
        { id: "b1", label: "New Node", children: [] },
        { id: "b2", label: "New Node", children: [] },
      ],
    },
  ],
};

let nodeCounter = 100;
const nextId = () => `n${++nodeCounter}`;

function findAndUpdate(
  node: TreeNode,
  id: string,
  updater: (n: TreeNode) => TreeNode,
): TreeNode {
  if (node.id === id) return updater(node);
  return {
    ...node,
    children: node.children.map((c) => findAndUpdate(c, id, updater)),
  };
}

function findAndRemove(node: TreeNode, id: string): TreeNode {
  return {
    ...node,
    children: node.children
      .filter((c) => c.id !== id)
      .map((c) => findAndRemove(c, id)),
  };
}

const NODE_W = 180;
const NODE_H = 56;

type FlowData = { nodes: Node[]; edges: Edge[] };

function buildFlow(
  tree: TreeNode,
  collapsed: Set<string>,
  selectedId: string | null,
  search: string,
  onToggle: (id: string) => void,
  onAddChild: (id: string) => void,
  onRemove: (id: string) => void,
  onSelect: (id: string) => void,
  onRename: (id: string, label: string) => void,
): FlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const q = search.trim().toLowerCase();

  const walk = (n: TreeNode, depth: number) => {
    const hasChildren = n.children.length > 0;
    const isCollapsed = collapsed.has(n.id);
    const matches = q.length > 0 && n.label.toLowerCase().includes(q);
    nodes.push({
      id: n.id,
      type: "tree",
      position: { x: 0, y: 0 },
      data: {
        label: n.label,
        depth,
        hasChildren,
        collapsed: isCollapsed,
        childCount: n.children.length,
        selected: selectedId === n.id,
        match: matches,
        isRoot: depth === 0,
        onToggle: () => onToggle(n.id),
        onAddChild: () => onAddChild(n.id),
        onRemove: () => onRemove(n.id),
        onSelect: () => onSelect(n.id),
        onRename: (label: string) => onRename(n.id, label),
      },
      width: NODE_W,
      height: NODE_H,
    });
    if (!isCollapsed) {
      for (const c of n.children) {
        edges.push({
          id: `${n.id}->${c.id}`,
          source: n.id,
          target: c.id,
          type: "smoothstep",
          style: { stroke: "var(--edge-stroke)", strokeWidth: 2 },
        });
        walk(c, depth + 1);
      }
    }
  };
  walk(tree, 0);

  // Dagre layout
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  nodes.forEach((n) => {
    const p = g.node(n.id);
    n.position = { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 };
    n.targetPosition = Position.Top;
    n.sourcePosition = Position.Bottom;
  });

  return { nodes, edges };
}

function TreeNodeCard({ data }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(data.label);
  }, [data.label, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== data.label) data.onRename(v);
    setEditing(false);
  };

  return (
    <div
      onClick={data.onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={[
        "group relative flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-all cursor-pointer",
        "bg-card text-card-foreground",
        data.isRoot
          ? "border-primary/60 bg-primary text-primary-foreground"
          : "border-border hover:border-primary/60",
        data.selected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "",
        data.match ? "ring-2 ring-amber-400" : "",
      ].join(" ")}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      {data.hasChildren ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle();
          }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent"
          aria-label={data.collapsed ? "Expand" : "Collapse"}
        >
          {data.collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      ) : (
        <div className="h-6 w-6 shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              else if (e.key === "Escape") {
                setDraft(data.label);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-border bg-background px-1 text-sm font-medium text-foreground outline-none focus:border-primary"
          />
        ) : (
          <span className="truncate text-sm font-medium leading-tight">{data.label}</span>
        )}
        <span className={["text-[10px] leading-tight opacity-70"].join(" ")}>
          L{data.depth} · {data.childCount} child{data.childCount === 1 ? "" : "ren"}
        </span>
      </div>
      <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="flex h-5 w-5 items-center justify-center rounded bg-background/80 text-foreground hover:bg-accent"
          aria-label="Rename"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild();
          }}
          className="flex h-5 w-5 items-center justify-center rounded bg-background/80 text-foreground hover:bg-accent"
          aria-label="Add child"
        >
          <Plus className="h-3 w-3" />
        </button>
        {!data.isRoot && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onRemove();
            }}
            className="flex h-5 w-5 items-center justify-center rounded bg-background/80 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { tree: TreeNodeCard };

export function TreeVisualizer() {
  const [tree, setTree] = useState<TreeNode>(initialTree);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addChild = useCallback((id: string) => {
    setTree((t) =>
      findAndUpdate(t, id, (n) => ({
        ...n,
        children: [...n.children, { id: nextId(), label: "New Node", children: [] }],
      })),
    );
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setTree((t) => findAndRemove(t, id));
  }, []);

  const rename = useCallback((id: string, label: string) => {
    setTree((t) => findAndUpdate(t, id, (n) => ({ ...n, label })));
  }, []);

  const { nodes, edges } = useMemo(
    () =>
      buildFlow(
        tree,
        collapsed,
        selectedId,
        search,
        toggle,
        addChild,
        remove,
        setSelectedId,
        rename,
      ),
    [tree, collapsed, selectedId, search, toggle, addChild, remove, rename],
  );

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tree Visualizer</h1>
          <p className="text-xs text-muted-foreground">
            Click a node to select · ▸ to expand/collapse · hover to add or delete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search nodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCollapsed(new Set())}
          >
            Expand all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ids = new Set<string>();
              const walk = (n: TreeNode) => {
                if (n.children.length) {
                  ids.add(n.id);
                  n.children.forEach(walk);
                }
              };
              tree.children.forEach(walk);
              setCollapsed(ids);
            }}
          >
            Collapse all
          </Button>
        </div>
      </header>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          minZoom={0.2}
          maxZoom={2}
        >
          <Background gap={24} size={1} color="var(--bg-dot)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="!bg-card" />
        </ReactFlow>
      </div>
    </div>
  );
}