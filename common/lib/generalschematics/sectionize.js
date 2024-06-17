import { visit } from 'unist-util-visit';
import { inspect } from "unist-util-inspect"

export default function sectionize() {
    return (tree) => {
        visit(tree, 'heading', (node, index, parent) => {
            if (node.depth !== 2) return;
            const paragraph = parent.children[index + 1];
            if (!paragraph || paragraph.type !== "paragraph") return;

            const section = {
                type: 'section',
                depth: node.depth,
                children: [node, paragraph],
            }

            parent.children.splice(index, 2, section);
        });
    }
}