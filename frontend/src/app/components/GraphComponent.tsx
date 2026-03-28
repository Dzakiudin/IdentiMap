"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function GraphComponent({ results }: { results: any }) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const graphData = useMemo(() => {
    const nodes: any[] = [{ id: "Target Info", group: 1 }];
    const links: any[] = [];

    // Add usernames
    if (results?.findings?.usernames?.accounts) {
      results.findings.usernames.accounts.forEach((acc: any) => {
        nodes.push({ id: acc.site, group: 2 });
        links.push({ source: "Target Info", target: acc.site });
      });
    }

    // Add emails
    if (results?.findings?.email_info?.registered_sites) {
      results.findings.email_info.registered_sites.forEach((site: string) => {
        const id = `Email: ${site}`;
        nodes.push({ id, group: 3 });
        links.push({ source: "Target Info", target: id });
      });
    }

    // Add breaches
    if (results?.findings?.breach_info?.breaches_found) {
       nodes.push({ id: "Data Breach Found", group: 4 });
       links.push({ source: "Target Info", target: "Data Breach Found" });
    }

    return { nodes, links };
  }, [results]);

  if (!mounted) return <div className="h-[300px] w-full bg-black/80 flex items-center justify-center border border-cyan-900/50">Initializing Connective Intel...</div>;

  return (
    <div className="h-[300px] w-full border border-cyan-900/50 bg-[#050505] relative cursor-crosshair">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={700} // Rough width matching the container
        height={300}
        nodeLabel="id"
        nodeColor={(node: any) => {
          if (node.group === 1) return "#00ff41"; // Target = Green
          if (node.group === 2) return "#00f3ff"; // Username = Cyan
          if (node.group === 3) return "#a855f7"; // Email = Purple
          if (node.group === 4) return "#ef4444"; // Breach = Red
          return "#ffffff";
        }}
        linkColor={() => "rgba(0, 243, 255, 0.2)"}
        backgroundColor="#050505"
        nodeRelSize={6}
        linkWidth={1.5}
      />
      
      <div className="absolute top-2 left-2 bg-black/80 border border-cyan-800 p-2 text-[10px] text-cyan-400 z-[400] font-mono shadow-[0_0_10px_rgba(0,243,255,0.2)]">
        ENTITY CORRELATION GRAPH
      </div>
    </div>
  );
}
