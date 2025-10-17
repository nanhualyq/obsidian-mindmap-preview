import { App, PluginSettingTab, Setting } from "obsidian";
import MindmapPlugin from "./main";

export default class SettingTab extends PluginSettingTab {
	plugin: MindmapPlugin;
	constructor(app: App, plugin: MindmapPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName("Freeplane path")
			.setDesc("The path to the freeplane executable.")
			.addText((text) =>
				text
					.setPlaceholder("freeplane")
					.setValue(this.plugin.settings.freeplanePath)
					.onChange(async (value) => {
						this.plugin.settings.freeplanePath = value;
						await this.plugin.saveData(this.plugin.settings);
					})
			);
	}
}
