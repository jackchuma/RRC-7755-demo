import { ProofType } from "@/utils/types/proof";

interface ProofVisualizerProps {
  proof?: ProofType;
}

export default function ProofVisualizer({ proof }: ProofVisualizerProps) {
  return (
    <div className="w-full border overflow-scroll rounded-lg p-4">
      <h1>Proof Visualizer</h1>
      {proof && <pre>{JSON.stringify(proof, null, 2)}</pre>}
    </div>
  );
}
