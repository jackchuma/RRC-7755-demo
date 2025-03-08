import { RequestType } from "@/utils/types/request";

interface SmartAccountWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onSwitchToStandard: () => void;
}

export default function SmartAccountWarningModal({
  isOpen,
  onClose,
  onContinue,
  onSwitchToStandard,
}: SmartAccountWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border/30 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Smart Account Warning</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm">
            <strong>Important:</strong> Smart Account requests only work if you
            are connected with an Externally Owned Account (EOA). This is
            because of a destination chain paymaster mechanism. The request type
            mimics a user submitting smart account requests but the fulfiller
            needs to be an EOA in this case. For this demo, your connected
            wallet is the fulfiller.
          </p>

          <p className="text-sm">
            If you're connected with a smart wallet (like Safe, Argent, etc.),
            this request type will not work properly with the way this 7755 demo
            is structured.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
            Please ensure you're connected with an EOA before proceeding with a
            Smart Account request.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onSwitchToStandard}
              className="px-4 py-2 rounded-md text-white bg-slate-600 hover:bg-slate-700 transition-colors w-full sm:w-1/2"
            >
              Switch to Standard
            </button>

            <button
              onClick={onContinue}
              className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full sm:w-1/2"
            >
              I'm using an EOA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
