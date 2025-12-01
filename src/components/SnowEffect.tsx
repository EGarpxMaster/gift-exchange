export function SnowEffect() {
    const snowflakes = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        animationDelay: Math.random() * 5,
        fontSize: 10 + Math.random() * 10,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute text-white opacity-70 animate-snow-fall"
                    style={{
                        left: `${flake.left}%`,
                        top: '-10%',
                        fontSize: `${flake.fontSize}px`,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `${flake.animationDelay}s`,
                    }}
                >
                    ❄️
                </div>
            ))}
        </div>
    );
}
