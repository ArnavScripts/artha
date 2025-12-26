import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type SageActionType = 'NAVIGATE' | 'REQUEST_ACCESS' | 'EXECUTE_FUNC' | 'NONE';

export interface SageAction {
    type: SageActionType;
    payload?: string;
}

export interface SageResponse {
    message: string;
    action?: SageAction;
}

export function useSageExecutor() {
    const navigate = useNavigate();

    const executeAction = (action: SageAction) => {
        console.log("Executing Sage Action:", action);

        switch (action.type) {
            case 'NAVIGATE':
                if (action.payload) {
                    navigate(action.payload);
                    toast.info("Navigating...", {
                        description: `Sage is taking you to ${action.payload}`
                    });
                }
                break;

            case 'REQUEST_ACCESS':
                // MVP: Auto-grant or show a simple toast
                toast.warning("Permission Requested", {
                    description: `Sage requested: ${action.payload}. Access granted for this session.`,
                    action: {
                        label: "Revoke",
                        onClick: () => console.log("Revoked")
                    }
                });
                break;

            case 'EXECUTE_FUNC':
                if (action.payload === 'refresh_simulation') {
                    toast.success("Roadmap Generated", {
                        description: "Refreshing Intelligence War Room...",
                    });
                    // Short delay to allow toast to be seen
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    toast.success("Function Triggered", {
                        description: `Executing: ${action.payload}`
                    });
                }
                break;

            case 'NONE':
            default:
                break;
        }
    };

    return { executeAction };
}
