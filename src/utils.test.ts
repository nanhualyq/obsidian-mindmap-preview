import { describe, expect, test } from "@jest/globals";
import { buildXml, makeTree } from "./utils";

describe("makeTree", () => {
	describe("single root", () => {
		test("h1", () => {
			const tree = makeTree("# this is a h1");
			expect(tree).toMatchObject({ text: "this is a h1" });
		});
		test("h3", () => {
			const tree = makeTree("### this is a h3");
			expect(tree).toMatchObject({ text: "this is a h3" });
		});
		test("p", () => {
			const tree = makeTree("this is a p");
			expect(tree).toMatchObject({ text: "this is a p" });
		});
	});
	describe("multiple root", () => {
		test("two h1", () => {
			const tree = makeTree("# this is a h1-1\n# this is a h1-2");
			expect(tree).toMatchObject({
				text: "Root",
				children: [
					{ text: "this is a h1-1" },
					{ text: "this is a h1-2" },
				],
			});
		});
		test("p and h1", () => {
			const tree = makeTree("this is a p\n# this is a h1");
			expect(tree).toMatchObject({
				children: [{ text: "this is a p" }, { text: "this is a h1" }],
			});
		});
	});
	describe("nest headings", () => {
		test("h1 > h2", () => {
			const tree = makeTree("# h1\n## h2");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "h2" }],
			});
		});
		test("h1 + p", () => {
			const tree = makeTree("# h1\nthis is a p");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "this is a p" }],
			});
		});
		test("h1 > h2 > h3", () => {
			const tree = makeTree("# h1\n## h2\n### h3");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "h2", children: [{ text: "h3" }] }],
			});
		});
		test("h1 > h2 & h2", () => {
			const tree = makeTree("# h1\n## h2-1\n## h2-2");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "h2-1" }, { text: "h2-2" }],
			});
		});
		test("h1 > h2 > h3 & h2", () => {
			const tree = makeTree("# h1\n## h2-1\n### h3\n## h2-2");
			expect(tree).toMatchObject({
				text: "h1",
				children: [
					{ text: "h2-1", children: [{ text: "h3" }] },
					{ text: "h2-2" },
				],
			});
		});
		// three h1 and keep sort
		test("three h1", () => {
			const tree = makeTree(
				"# this is a h1-1\n# this is a h1-2\n# this is a h1-3"
			);
			expect(tree).toMatchObject({
				text: "Root",
				children: [
					{ text: "this is a h1-1" },
					{ text: "this is a h1-2" },
					{ text: "this is a h1-3" },
				],
			});
		});
	});
	describe("nest list", () => {
		test("ul > li", () => {
			const tree = makeTree("- a");
			expect(tree).toMatchObject({
				text: "a",
			});
		});
		test("ul > li > ul > li", () => {
			const tree = makeTree("- a\n  - b");
			expect(tree).toMatchObject({
				text: "a",
				children: [{ text: "b" }],
			});
		});
		test("ul > li > ul > li > ul > li", () => {
			const tree = makeTree("- a\n  - b\n    - c");
			expect(tree).toMatchObject({
				text: "a",
				children: [{ text: "b", children: [{ text: "c" }] }],
			});
		});
		test("ul > li > ul > li & li", () => {
			const tree = makeTree("- a\n  - b\n  - c");
			expect(tree).toMatchObject({
				text: "a",
				children: [{ text: "b" }, { text: "c" }],
			});
		});
		test("ul > li & li > ul > li", () => {
			const tree = makeTree("- a\n- b\n  - c");
			expect(tree).toMatchObject({
				children: [
					{ text: "a" },
					{ text: "b", children: [{ text: "c" }] },
				],
			});
		});
		test("h1 > ul > li", () => {
			const tree = makeTree("# h1\n- a");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "a" }],
			});
		});
		test("h1 > ul > li > ul > li", () => {
			const tree = makeTree("# h1\n- a\n  - b");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "a", children: [{ text: "b" }] }],
			});
		});
		// ol
		test("ol > li", () => {
			const tree = makeTree("1. a");
			expect(tree).toMatchObject({
				text: "a",
			});
		});
		test("ol > li > ol > li", () => {
			const tree = makeTree("1. a\n   1. b");
			expect(tree).toMatchObject({
				text: "a",
				children: [{ text: "b" }],
			});
		});
		test("ol > li > ol > li > ol > li", () => {
			const tree = makeTree("1. a\n   1. b\n      1. c");
			expect(tree).toMatchObject({
				text: "a",
				children: [{ text: "b", children: [{ text: "c" }] }],
			});
		});
		test("ol > li > ol > li & li", () => {
			const tree = makeTree("1. a\n   1. b\n   2. c");
			expect(tree).toMatchObject({
				text: "a",
				children: [{ text: "b" }, { text: "c" }],
			});
		});
		test("ol > li & li > ol > li", () => {
			const tree = makeTree("1. a\n2. b\n   1. c");
			expect(tree).toMatchObject({
				children: [
					{ text: "a" },
					{ text: "b", children: [{ text: "c" }] },
				],
			});
		});
		test("h1 > ol > li", () => {
			const tree = makeTree("# h1\n1. a");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "a" }],
			});
		});
		test("h1 > ol > li > ol > li", () => {
			const tree = makeTree("# h1\n1. a\n   1. b");
			expect(tree).toMatchObject({
				text: "h1",
				children: [{ text: "a", children: [{ text: "b" }] }],
			});
		});
	});
	// link
	describe("link", () => {
		// test("internal link", () => {
		// 	const tree = makeTree("[[a]]");
		// 	expect(tree).toMatchObject({
		// 		text: "a",
		// 	});
		// });
		// test("internal link with alias", () => {
		// 	const tree = makeTree("[[a|b]]");
		// 	expect(tree).toMatchObject({
		// 		text: "b",
		// 	});
		// });
		test("external link", () => {
			const tree = makeTree("[a](b)");
			expect(tree).toMatchObject({
				text: '<a href="b">a</a>',
			});
		});
	});
});

describe("buildXml", () => {
	test("one root", () => {
		const xml = buildXml({
			text: "root",
			children: [],
			tag: "",
		});
		expect(xml).toBe(`<node TEXT="root"></node>`);
	});
	test("multiple root", () => {
		const xml = buildXml({
			text: "root",
			children: [
				{ text: "h1", children: [], tag: "" },
				{ text: "h2", children: [], tag: "" },
			],
			tag: "",
		});
		expect(xml).toBe(
			`<node TEXT="root"><node TEXT="h1"></node><node TEXT="h2"></node></node>`
		);
	});
	test("nest headings", () => {
		const xml = buildXml({
			text: "root",
			children: [
				{
					text: "h1",
					children: [{ text: "h2", children: [], tag: "" }],
					tag: "",
				},
			],
			tag: "",
		});
		expect(xml).toBe(
			`<node TEXT="root"><node TEXT="h1"><node TEXT="h2"></node></node></node>`
		);
	});
	// nest list
	test("nest list", () => {
		const xml = buildXml({
			text: "root",
			children: [
				{
					text: "a",
					children: [{ text: "b", children: [], tag: "" }],
					tag: "",
				},
			],
			tag: "",
		});
		expect(xml).toBe(
			`<node TEXT="root"><node TEXT="a"><node TEXT="b"></node></node></node>`
		);
	});
	test("richcontent", () => {
		const xml = buildXml({
			text: '<a href="b">a</a>',
			hasHtml: true,
			children: [],
			tag: "",
		});
		expect(xml).toBe(
			`<node><richcontent TYPE="NODE"><html><body><a href="b">a</a></body></html></richcontent></node>`
		);
	});
	test("normal + blob + a on root text", () => {
		const xml = buildXml({
			text: 'normal <strong>blob</strong> <a href="b">a</a>',
			hasHtml: true,
			children: [],
			tag: "",
		});
		expect(xml).toBe(
			`<node><richcontent TYPE="NODE"><html><body>normal <strong>blob</strong> <a href="b">a</a></body></html></richcontent></node>`
		);
	});
	// text includes double quotation marks
	test("text includes double quotation marks", () => {
		const xml = buildXml({
			text: `text with "double quotes"`,
			children: [],
			tag: "",
		});
		expect(xml).toBe(
			`<node TEXT="text with &quot;double quotes&quot;"></node>`
		);
	});
});
