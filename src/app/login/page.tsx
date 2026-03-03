import { login, signup } from './actions'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
    const searchParams = await props.searchParams;
    const message = searchParams?.message as string | undefined;

    return (
        <div className="min-h-screen flex items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black text-white p-4">
            <div className="w-full max-w-md relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-20 transform -skew-y-6 z-0"></div>

                <div className="relative z-10 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ShowMiro</h1>
                        <p className="text-neutral-400">Sign in to your visual gallery</p>
                    </div>

                    <form className="flex flex-col gap-5" action={login}>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1.5" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1.5" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                        </div>

                        {message && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm text-center">
                                {message}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mt-4">
                            <button formAction={login} className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-neutral-200 transition-colors">
                                Sign In
                            </button>
                            <button formAction={signup} className="w-full bg-transparent border border-neutral-700 text-white font-semibold rounded-lg px-4 py-3 hover:bg-neutral-800 transition-colors">
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
