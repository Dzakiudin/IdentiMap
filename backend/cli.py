import typer
from rich.console import Console
from rich.panel import Panel
import asyncio
from app.analyzer.correlator import ProfileCorrelator
from rich.panel import Panel

app = typer.Typer(help="IdentiMap OSINT CLI")
console = Console()

@app.command()
def scan(
    name: str = typer.Option(None, "--name", "-n", help="Target real name"),
    username: str = typer.Option(None, "--username", "-u", help="Target username(s), comma-separated"),
    phone: str = typer.Option(None, "--phone", "-p", help="Target phone number (with + country code)"),
    dob: str = typer.Option(None, "--dob", "-d", help="Target date of birth"),
    address: str = typer.Option(None, "--address", "-a", help="Target full address"),
    email: str = typer.Option(None, "--email", "-e", help="Target email address")
):
    """
    Run an advanced OSINT scan on a target identity.
    """
    console.print(Panel.fit("[bold green]IdentiMap OSINT Engine Initialized[/bold green]", title="IdentiMap"))
    
    # Collect input
    target = {
        "real_name": name,
        "username": username,
        "phone": phone,
        "dob": dob,
        "address": address,
        "email": email,
        "image_url": image
    }
    
    active_params = {k: v for k, v in target.items() if v}
    if not active_params:
        console.print("[bold red]Error:[/bold red] You must provide at least one parameter to scan.")
        raise typer.Exit(code=1)
        
    console.print(f"[bold cyan]ID[/bold cyan]: [bold white]{target['real_name'] or 'UNKNOWN'}[/bold white]")
    console.print(f"[bold cyan]TARGETS[/bold cyan]: {', '.join(f'{k}={v}' for k, v in active_params.items())}")
    console.print("[dim]--------------------------------------[/dim]")
    console.print("[dim green]Developed by: Ahmad dzakiudin[/dim green]")
    console.print("[dim green]IG: @jakijekiiii | FB: jakijekijuki | GitHub: Dzakiudin[/dim green]")
    console.print("[dim]--------------------------------------[/dim]\n")
    
    # Invoke Correlation Engine
    correlator = ProfileCorrelator()
    
    with console.status("[bold neon_green]Initializing OSINT Correlation Engine...[/bold neon_green]") as status:
        results = asyncio.run(correlator.profile(active_params))
        
    console.print(Panel.fit(f"[bold magenta]Overall Confidence Score:[/bold magenta] {results['overall_confidence_score']}%", title="Results"))
    console.print("[bold green]Username Findings:[/bold green]", results['findings']['usernames'])
    console.print("[bold green]Phone Findings:[/bold green]", results['findings']['phone_info'])
    console.print("[bold green]Web Footprints:[/bold green]", results['findings']['web_footprints'])

if __name__ == "__main__":
    app()
