import { Notice, Plugin, TFile } from "obsidian";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { makeTree, object2xml, ROOT_TAG } from "./utils";
import { createHash } from "crypto";

export default class MindmapPlugin extends Plugin {
	onload() {
		this.addCommand({
			id: "view-in-freeplane",
			name: "Open Freeplane View for current file",
			checkCallback: (checking) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) return false;

				if (!checking) {
					this.openFreeplane(activeFile);
				}

				return true;
			},
		});
	}
	async openFreeplane(activeFile: TFile) {
		const tmpDir = os.tmpdir(); // 系统级临时目录
		const tmpFile = path.join(
			tmpDir,
			createHash("md5").update(activeFile.path).digest("hex") + ".mm"
		);

		const text = await this.app.vault.read(activeFile);
		const tree = makeTree(text);
		if (tree.tag === ROOT_TAG) {
			tree.text = activeFile.basename;
		}
		const mm = object2xml(tree);
		fs.writeFileSync(tmpFile, mm);
		this.openMM(tmpFile);
	}

	private openMM(tmpFile: string) {
		// 根据操作系统选择命令打开文件
		const platform = process.platform;
		let openCmd = "";

		if (platform === "darwin") openCmd = `freeplane "${tmpFile}"`; // macOS
		else if (platform === "win32")
			openCmd = `freeplane "" "${tmpFile}"`; // Windows
		else openCmd = `freeplane "${tmpFile}"`; // Linux

		// 执行系统命令
		exec(openCmd, (err) => {
			if (err) {
				console.error("打开文件失败:", err);
				new Notice("打开文件失败，请检查系统命令。");
			} else {
				console.log("已打开:", tmpFile);
			}
		});
	}

	onunload() {}
}
