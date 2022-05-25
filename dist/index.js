"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const ms = require('ms');
    const axios = require('axios');
    const { webhook_url, api_url, api_port, api_endpoint, discord_id, notify_lower_than_hashrate, notify_lower_than_hashrate_number } = require("./config.json");
    const Colors = {
        DEFAULT: 0x000000,
        WHITE: 0xffffff,
        AQUA: 0x1abc9c,
        GREEN: 0x57f287,
        BLUE: 0x3498db,
        YELLOW: 0xfee75c,
        PURPLE: 0x9b59b6,
        LUMINOUS_VIVID_PINK: 0xe91e63,
        FUCHSIA: 0xeb459e,
        GOLD: 0xf1c40f,
        ORANGE: 0xe67e22,
        RED: 0xed4245,
        GREY: 0x95a5a6,
        NAVY: 0x34495e,
        DARK_AQUA: 0x11806a,
        DARK_GREEN: 0x1f8b4c,
        DARK_BLUE: 0x206694,
        DARK_PURPLE: 0x71368a,
        DARK_VIVID_PINK: 0xad1457,
        DARK_GOLD: 0xc27c0e,
        DARK_ORANGE: 0xa84300,
        DARK_RED: 0x992d22,
        DARK_GREY: 0x979c9f,
        DARKER_GREY: 0x7f8c8d,
        LIGHT_GREY: 0xbcc0c0,
        DARK_NAVY: 0x2c3e50,
        BLURPLE: 0x5865f2,
        GREYPLE: 0x99aab5,
        DARK_BUT_NOT_BLACK: 0x2c2f33,
        NOT_QUITE_BLACK: 0x23272a,
    };
    class Embed {
        constructor(title = "", color = 0, timestamp = new Date(Date.now()), fields = []) {
            this.title = title,
                this.color = color,
                this.timestamp = timestamp,
                this.fields = fields;
        }
        setTitle(title) {
            this.title = title;
        }
        setColor(color) {
            var _a;
            if (typeof color === 'string') {
                color = (_a = Colors[color]) !== null && _a !== void 0 ? _a : parseInt(color.replace('#', ''), 16);
                this.color = color;
            }
            else
                this.color = color;
        }
        addField(name, value, inline) {
            this.fields.push({ name: name, value: value, inline: inline });
        }
    }
    function request(url, method = "GET", data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let request_config = {
                    url: url,
                    method: method,
                    headers: { "Content-type": "application/json" },
                    data: data
                };
                switch (method) {
                    case "GET":
                        let result = yield axios(request_config);
                        return result.data;
                    case "POST":
                        yield axios(request_config);
                        break;
                }
            }
            catch (err) {
                console.error(err);
                return "Error";
            }
        });
    }
    let is_rig_offline_count = 0;
    let is_rig_offline_bool = false;
    function update_rig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let res = yield request(`${api_url}:${api_port + api_endpoint}`);
                if (res === "Error") {
                    if (!is_rig_offline_bool) {
                        is_rig_offline_count++;
                        if (is_rig_offline_count >= 5) {
                            is_rig_offline_bool = true;
                            yield request(webhook_url, "POST", { content: `<@${discord_id}>\nthis rig has gone offline.` });
                        }
                    }
                    return;
                }
                for (const device of res.miner.devices) {
                    let Device_Embed = new Embed();
                    Device_Embed.setTitle(device.info);
                    Device_Embed.setColor("GOLD");
                    Object.keys(device).forEach(key => {
                        let name = key.toString().replace(/_/g, " ");
                        Device_Embed.addField(name.charAt(0).toUpperCase() + name.slice(1), device[key].toString(), true);
                    });
                    yield request(webhook_url, "POST", { embeds: [Device_Embed] });
                }
                let Miner_Embed = new Embed();
                Miner_Embed.setTitle("Miner");
                Miner_Embed.setColor("BLURPLE");
                Object.keys(res.miner).forEach(key => {
                    if (key === "devices")
                        [];
                    else {
                        let name = key.toString().replace(/_/g, " ");
                        Miner_Embed.addField(name.charAt(0).toUpperCase() + name.slice(1), res.miner[key].toString(), true);
                    }
                });
                Miner_Embed.addField("Reboots", res.reboot_times.toString(), true);
                Miner_Embed.addField("Start Time", `<t:${res.start_time}> <t:${res.start_time}:F>`, true);
                Miner_Embed.addField("Version", res.version.toString(), true);
                let Stratum_Embed = new Embed();
                Stratum_Embed.setTitle("Stratum");
                Stratum_Embed.setColor("GREEN");
                Object.keys(res.stratum).forEach(key => {
                    let name = key.toString().replace(/_/g, " ");
                    Stratum_Embed.addField(name.charAt(0).toUpperCase() + name.slice(1), res.stratum[key].toString(), true);
                });
                is_rig_offline_bool = false;
                is_rig_offline_count = 0;
                yield request(webhook_url, "POST", { embeds: [Miner_Embed, Stratum_Embed] });
                if (notify_lower_than_hashrate) {
                    if (Number(res.miner.total_hashrate.replace(/[A-Z]/g, "")) < Number(notify_lower_than_hashrate_number)) {
                        yield request(webhook_url, "POST", { content: `<@${discord_id}>, The current hashrate \`${res.miner.total_hashrate.toString()}\` is below the set threshold \`${notify_lower_than_hashrate_number} M\`` });
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    console.log("Running");
    update_rig();
    setInterval(update_rig, ms("1m"));
}))();
