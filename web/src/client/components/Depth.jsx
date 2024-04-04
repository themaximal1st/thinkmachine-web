export default function Depth(params) {
    if (!params.show) return;
    if (params.maxDepth === 0) return;

    return (
        <div className="absolute top-0 right-0 bottom-0 z-20 flex justify-center items-center w-12 h-full text-white">
            <input
                type="range"
                ref={params.depthRef}
                min="0"
                max={params.maxDepth}
                step="1"
                value={params.depth}
                className="depth-slider"
                onChange={(e) => params.toggleDepth(parseInt(e.target.value))}
            />
        </div>
    );
}
