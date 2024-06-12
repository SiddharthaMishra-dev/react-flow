"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import ReactFlow, { Background, Controls, Node, ReactFlowInstance, useNodesState } from "reactflow";

import Note from "@/components/Note";

import "reactflow/dist/style.css";

const COLOR = [
  "#fed7aa",
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#e9d5ff",
  "#c7d2fe",
  "#fbcfe8",
  "#a5f3fc",
  "#fde68a",
];

let saveTimeout: NodeJS.Timeout | null = null;
let defaultX = 100;
let defaultY = 100;

const nodeTypes = {
  note: Note,
};

const Whiteboard = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const rfInstanceRef = useRef<ReactFlowInstance | null>();

  let add = 0;

  const onSave = useCallback(() => {
    const instance = rfInstanceRef.current;
    if (instance) {
      const flow = instance.toObject();
      localStorage.setItem("flow", JSON.stringify(flow));
    }
  }, []);

  const onRestore = useCallback(() => {
    const restoreFn = async () => {
      const rawFlow = await JSON.parse(localStorage.getItem("flow") || "{}");
      const newFlow = rawFlow.nodes.map((node: Node) => {
        return {
          ...node,
          data: {
            ...node.data,
            titleChange: onTitleChange,
            contentChange: onContentChange,
          },
        };
      });
      if (newFlow) {
        setNodes(newFlow || []);
      }
    };
    restoreFn();
  }, [setNodes]);

  const onTitleChange = (e: any, id: string) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id !== id) return node;
        return {
          ...node,
          data: {
            ...node.data,
            title: e.target.value,
          },
        };
      });
      return newNodes;
    });

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      onSave();
    }, 2000);
  };

  const onContentChange = (e: any, id: string) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id !== id) return node;
        return {
          ...node,
          data: {
            ...node.data,
            content: e.target.value,
          },
        };
      });
      return newNodes;
    });

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      onSave();
    }, 2000);
  };

  const handleAddNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: String(nds.length + 1),
        type: "note",
        position: {
          x: (defaultX += add),
          y: (defaultY += add),
        },
        data: {
          id: String(nds.length + 1),
          titleChange: onTitleChange,
          contentChange: onContentChange,
          title: `Note ${nds.length + 1}`,
          content: `This is note ${nds.length + 1}`,
          color: COLOR[Math.floor(Math.random() * COLOR.length)],
        },
      },
    ]);
    add += 20;
  };

  useEffect(() => {
    const rawVal = localStorage.getItem("flow");
    if (rawVal === null) {
      setNodes([
        {
          id: "1",
          type: "note",
          position: {
            x: 50,
            y: 50,
          },
          data: {
            id: "1",
            titleChange: onTitleChange,
            contentChange: onContentChange,
            title: "",
            content: "This is note 1",
            color: COLOR[Math.floor(Math.random() * COLOR.length)],
          },
        },
        {
          id: "2",
          type: "note",
          position: {
            x: 100,
            y: 100,
          },
          data: {
            id: "2",
            titleChange: onTitleChange,
            contentChange: onContentChange,
            title: "",
            content: "This is note 2",
            color: COLOR[Math.floor(Math.random() * COLOR.length)],
          },
        },
      ]);
    } else {
      const restoreFn = async () => {
        const rawFlow = await JSON.parse(rawVal || "{}");
        const newFlow = rawFlow.nodes.map((node: Node) => {
          return {
            ...node,
            data: {
              ...node.data,
              titleChange: onTitleChange,
              contentChange: onContentChange,
            },
          };
        });
        if (newFlow) {
          setNodes(newFlow || []);
        }
      };
      restoreFn();
    }
  }, []);

  if (nodes.length === 0) {
    return <div>Loading...</div>; // Render a loading state while nodes are being set
  }

  return (
    <div className="w-screen h-screen px-3 py-5">
      <div className="w-[99%] h-[95%] ring-2 ring-orange-400 overflow-hidden rounded-lg mx-auto">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onInit={(instance) => (rfInstanceRef.current = instance)}
          className="relative"
        >
          <Background />
          <Controls />
          <button
            className="absolute bg-orange-400 hover:bg-orange-500 transition px-3 py-2 rounded-md top-4 left-4 z-10 flex justify-center items-center gap-x-3"
            onMouseDown={handleAddNode}
          >
            Add
            <Plus className="h-5 w-5 " />
          </button>
        </ReactFlow>
      </div>
    </div>
  );
};

export default Whiteboard;
