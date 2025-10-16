import markdownit, { Token } from "markdown-it";
import { escape } from "lodash";

type Node = {
	text: string;
	hasHtml?: boolean;
	children: Node[];
	tag: string;
};

export const ROOT_TAG = `root_${Math.random()}`;

const tagsLevel = [ROOT_TAG, "h1", "h2", "h3", "h4", "h5", "h6"];

function getTagLevel(node: Node | markdownit.Token) {
	const i = tagsLevel.indexOf(node.tag);
	return i === -1 ? tagsLevel.length : i;
}

export function makeTree(text: string) {
	const md = new markdownit();
	const tokens = md.parse(text, {});
	const stack = tokens2stack(tokens);
	const tree = stack2tree(stack);
	if (tree.children.length === 1) {
		return tree.children[0];
	} else {
		return tree;
	}
}

function stack2tree(stack: Node[]) {
	const waitStack = [];
	while (stack.length > 1 || waitStack.length > 0) {
		const node = stack.pop();
		if (node) {
			const diff =
				getTagLevel(node) - getTagLevel(stack[stack.length - 1]);
			if (diff > 0) {
				stack[stack.length - 1].children.push(...flatList(node));
				stack.push(...waitStack);
				waitStack.length = 0;
			} else {
				waitStack.unshift(node);
			}
		}
	}
	return stack[0];
}

function tokens2stack(tokens: Token[]) {
	const ROOT_NODE: Node = {
		text: "Root",
		children: [],
		tag: ROOT_TAG,
	};
	const stack: Node[] = [ROOT_NODE];
	for (const token of tokens) {
		if (token.type.endsWith("_open")) {
			stack.push({
				tag: token.tag,
				text: "",
				children: [],
			});
		} else if (token.type === "inline") {
			let text = "";
			let hasHtml = false;
			for (const iToken of token.children || []) {
				if (iToken.type.endsWith("_open")) {
					hasHtml = true;
					const attrs =
						iToken.attrs
							?.map((item) => `${item[0]}="${escape(item[1])}"`)
							.join(" ") || "";
					text += `<${iToken.tag} ${attrs}>`;
				} else if (iToken.type.endsWith("_close")) {
					text += `</${iToken.tag}>`;
				} else if (iToken.type === "text") {
					text += iToken.content;
				}
			}
			Object.assign(stack[stack.length - 1], { text, hasHtml });
		} else if (/^(?!heading).*_close/.test(token.type)) {
			if (["ul", "ol"].includes(token.tag) && token.level === 0) {
				continue;
			}
			const node = stack.pop();
			if (node) {
				stack[stack.length - 1].children.push(node);
			}
		}
	}
	return stack;
}

function flatList(node: Node): Node[] {
	if (!["ul", "ol"].includes(node.tag)) {
		return [node];
	}
	return node.children.map((item) => {
		const [p, ul] = item.children;
		if (ul) {
			p.children.push(...flatList(ul));
		}
		return p;
	});
}

export function object2xml(root: Node) {
	const xml = buildXml(root);
	return `<map version="freeplane 1.12.1">
		    ${xml}
		</map>`;
}
export function buildXml(root: Node): string {
	let text = "";
	let richcontent = "";
	if (root.hasHtml) {
		richcontent = `<richcontent TYPE="NODE">
		<html>
		<body>
		${root.text}
		</body>
		</html>
		</richcontent>`;
	} else {
		text = ` TEXT="${escape(root.text)}"`;
	}
	return `<node${text}>
	${richcontent}
	${root.children.map(buildXml).join("")}
	</node>`.replace(/\n|\s{2,}|\t/g, "");
}
