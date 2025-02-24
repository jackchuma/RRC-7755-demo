import { ProofType } from "@/utils/types/proof";

interface ProofVisualizerProps {
  proof?: ProofType;
}

export default function ProofVisualizer({ proof }: ProofVisualizerProps) {
  return (
    <div className="w-full">
      <div className="w-full overflow-scroll rounded-lg p-4 bg-gray-800 mb-4">
        {proof && <pre>{JSON.stringify(proof, null, 2)}</pre>}
      </div>
    </div>
  );
}
