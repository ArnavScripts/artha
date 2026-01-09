import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    Search,
    Zap,
    ShieldCheck,
    TrendingUp,
    FileText
} from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()
    const { setTheme } = useTheme()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="System">
                    <CommandItem onSelect={() => runCommand(() => navigate("/compliance/dashboard"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/compliance/intelligence"))}>
                        <Zap className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Intelligence War Room</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/compliance/reports"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Compliance Reports</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => runCommand(() => console.log("Simulating..."))}>
                        <Calculator className="mr-2 h-4 w-4" />
                        <span>Run Liability Simulation</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘,</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Theme">
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <div className="mr-2 h-4 w-4 bg-slate-900 rounded-full border border-slate-700"></div>
                        <span>Dark Mode</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <div className="mr-2 h-4 w-4 bg-white rounded-full border border-slate-200"></div>
                        <span>Light Mode</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
