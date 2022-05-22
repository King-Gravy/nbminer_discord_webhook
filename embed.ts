const { Colors } = require('./constants')
exports.Embed =
    class Embed {
        title: string;
        color: string | number;
        timestamp: Date;
        fields: object[];
        constructor(title: string = "", color: string | number = 0, timestamp: Date = new Date(Date.now()), fields: object[] = []) {
            this.title = title,
            this.color = color,
            this.timestamp = timestamp,
            this.fields = fields
        }
        setTitle(title: string): void {
            this.title = title
        }
        setColor(color: string | number): void {
            if (typeof color === 'string') {
                color = Colors[color] ?? parseInt(color.replace('#', ''), 16);
                this.color = color
            }
            else this.color = color
        }
        addField(name: string, value: string, inline: boolean): void {
            this.fields.push({name: name, value: value, inline: inline})
        }
    }