import { useState, useEffect } from "react";
import ForceGraph3D from "./ForceGraph3D";

const defaultProps = {
    backgroundColor: "#FAFAFA", // light mode vs dark mode
    showNavInfo: false,
};

export default function ForceGraph(props) {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    function handleResize() {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    // componentDidMount
    useEffect(() => {
        window.addEventListener("resize", handleResize);

        // componentWillUnmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const params = {
        ...defaultProps,
        ...props,
        width,
        height,
    };

    return <ForceGraph3D {...params} />;
}
