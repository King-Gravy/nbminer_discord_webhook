(async () => {

    const ms = require('ms')
    const axios = require('axios')
    const {
        webhook_url, api_url, api_port,
        api_endpoint, discord_id,
        notify_lower_than_hashrate,
        notify_lower_than_hashrate_number
    } = require("./config.json");

    const { Embed } = require('./embed')

    async function request(url: string, method: string = "GET", data: object = {}) {
        try {
            let request_config = {
                url: url,
                method: method,
                headers: { "Content-type": "application/json" },
                data: data
            }
            switch (method) {
                case "GET":
                    let result = await axios(request_config)
                    return result.data
                case "POST":
                    await axios(request_config)
                    break;
            }
        } catch (err) {
            console.error(err)
            return "Error"
        }
    }

    let is_rig_offline_count: number = 0
    let is_rig_offline_bool: boolean = false

    async function update_rig(): Promise<void> {
        try {
            let res = await request(`${api_url}:${api_port + api_endpoint}`)
            if (res === "Error") {
                if (!is_rig_offline_bool) {
                    is_rig_offline_count++
                    if (is_rig_offline_count >= 5) {
                        is_rig_offline_bool = true
                        await request(webhook_url, "POST", { content: `<@${discord_id}>\nthis rig has gone offline.` })
                    }
                }
                return;
            }

            for (const device of res.miner.devices) {
                let Device_Embed = new Embed()
                Device_Embed.setTitle(device.info)
                Device_Embed.setColor("GOLD")
                Object.keys(device).forEach(key => {
                    let name = key.toString().replace(/_/g, " ")
                    Device_Embed.addField(name.charAt(0).toUpperCase() + name.slice(1), device[key].toString(), true)
                })
                await request(webhook_url, "POST", { embeds: [Device_Embed] })
            }

            let Miner_Embed = new Embed()
            Miner_Embed.setTitle("Miner")
            Miner_Embed.setColor("BLURPLE")

            Object.keys(res.miner).forEach(key => {
                if (key === "devices") [];
                else {
                    let name = key.toString().replace(/_/g, " ")
                    Miner_Embed.addField(name.charAt(0).toUpperCase() + name.slice(1), res.miner[key].toString(), true)
                }
            })
            Miner_Embed.addField("Reboots", res.reboot_times.toString(), true)
            Miner_Embed.addField("Start Time", `<t:${res.start_time}> <t:${res.start_time}:F>`, true)
            Miner_Embed.addField("Version", res.version.toString(), true)

            let Stratum_Embed = new Embed()
            Stratum_Embed.setTitle("Stratum")
            Stratum_Embed.setColor("GREEN")

            Object.keys(res.stratum).forEach(key => {
                let name = key.toString().replace(/_/g, " ")
                Stratum_Embed.addField(name.charAt(0).toUpperCase() + name.slice(1), res.stratum[key].toString(), true)
            })

            is_rig_offline_bool = false
            is_rig_offline_count = 0
            await request(webhook_url, "POST", { embeds: [Miner_Embed, Stratum_Embed] })
            if(notify_lower_than_hashrate){
                if(Number(res.miner.total_hashrate.replace(/[A-Z]/g, "")) < Number(notify_lower_than_hashrate_number)) {
                    await request(webhook_url, "POST", { content: `<@${discord_id}>, The current hashrate \`${res.miner.total_hashrate.toString()}\` is below the set threshold \`${notify_lower_than_hashrate_number} M\``})
                }
            }

        } catch (err) { console.error(err) }
    }
    console.log("Running")
    update_rig()
    setInterval(update_rig, ms("1m"))
})();
