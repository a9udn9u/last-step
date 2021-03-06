"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("~/utils");
class Environment {
}
exports.Environment = Environment;
class Configuration {
}
exports.Configuration = Configuration;
class Rule {
}
exports.Rule = Rule;
class Task extends Map {
}
exports.Task = Task;
/**
 * Edit events
 */
var EditEvent;
(function (EditEvent) {
    EditEvent["ADD"] = "<CREATED>";
    EditEvent["DEL"] = "<DELETED>";
    EditEvent["CHG"] = "<CHANGED>";
})(EditEvent = exports.EditEvent || (exports.EditEvent = {}));
/**
 * Edit event queue
 */
class EditQueue {
    constructor() {
        this.events = [];
    }
    push(e) {
        this.events.push(e);
    }
    reduce() {
        let curr;
        if (this.events.length === 0)
            return undefined;
        if (this.events.length === 1)
            return this.events.pop();
        while (this.events.length) {
            let next = this.events.pop();
            if (!curr || curr === next ||
                curr === EditEvent.ADD && next === EditEvent.CHG ||
                curr === EditEvent.CHG && next === EditEvent.DEL) {
                curr = next;
            }
            if (curr === EditEvent.ADD && next === EditEvent.DEL ||
                curr === EditEvent.DEL && next === EditEvent.ADD) {
                curr = undefined;
            }
            if (curr === EditEvent.CHG && next === EditEvent.ADD ||
                curr === EditEvent.DEL && next === EditEvent.CHG) {
                utils_1.Utils.warn(`Bad state transition: ${curr} -> ${next}.`);
            }
        }
        return curr;
    }
}
exports.EditQueue = EditQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci1tb2RlbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL2J1aWxkZXItbW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQWdDO0FBSWhDO0NBU0M7QUFURCxrQ0FTQztBQUVEO0NBTUM7QUFORCxzQ0FNQztBQUVEO0NBTUM7QUFORCxvQkFNQztBQUVELFVBQWtCLFNBQVEsR0FBMkI7Q0FDcEQ7QUFERCxvQkFDQztBQUVEOztHQUVHO0FBQ0gsSUFBWSxTQUlYO0FBSkQsV0FBWSxTQUFTO0lBQ25CLDhCQUFpQixDQUFBO0lBQ2pCLDhCQUFpQixDQUFBO0lBQ2pCLDhCQUFpQixDQUFBO0FBQ25CLENBQUMsRUFKVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUlwQjtBQUVEOztHQUVHO0FBQ0g7SUFHRTtRQUNFLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxJQUFJLENBQUMsQ0FBWTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxJQUFJLENBQUM7UUFFVCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXZELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMxQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJO2dCQUN0QixJQUFJLEtBQUssU0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLEdBQUc7Z0JBQ2hELElBQUksS0FBSyxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNkLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLEdBQUc7Z0JBQ2hELElBQUksS0FBSyxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUNuQixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxHQUFHO2dCQUNoRCxJQUFJLEtBQUssU0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELGFBQUssQ0FBQyxJQUFJLENBQUMseUJBQXlCLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQzFELENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQW5DRCw4QkFtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBGaW5hbGl6ZXIgfSBmcm9tICd+L3Byb2Nlc3NvcnMvZmluYWxpemVyJztcblxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcbiAgcm9vdERpcjogc3RyaW5nO1xuICB3b3JrRGlyOiBzdHJpbmc7XG4gIHNvdXJjZURpcjogc3RyaW5nO1xuICB0YXJnZXREaXI6IHN0cmluZztcbiAgcmVsYXRpdmVTb3VyY2VEaXI6IHN0cmluZztcbiAgcmVsYXRpdmVUYXJnZXREaXI6IHN0cmluZztcbiAgdXNlckZpbGU6IHN0cmluZztcbiAgY29uZmlnOiBDb25maWd1cmF0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhdGlvbiB7XG4gIHJlbGF0aXZlU291cmNlRGlyOiBzdHJpbmc7XG4gIHJlbGF0aXZlVGFyZ2V0RGlyOiBzdHJpbmc7XG4gIHNvdXJjZURpcjogc3RyaW5nO1xuICB0YXJnZXREaXI6IHN0cmluZztcbiAgcnVsZXM6IFJ1bGVbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFJ1bGUge1xuICBzb3VyY2VzOiBzdHJpbmdbXXxSZWdFeHBbXTtcbiAgdGFyZ2V0czogc3RyaW5nfHN0cmluZ1tdO1xuICBwcm9jZXNzb3JzOiBQcm9jZXNzb3JbXTtcbiAgZmluYWxpemVyOiBGaW5hbGl6ZXI7XG4gIGZpbGVzOiBTZXQ8c3RyaW5nPjtcbn1cblxuZXhwb3J0IGNsYXNzIFRhc2sgZXh0ZW5kcyBNYXA8RWRpdEV2ZW50LCBTZXQ8c3RyaW5nPj4ge1xufVxuXG4vKipcbiAqIEVkaXQgZXZlbnRzXG4gKi9cbmV4cG9ydCBlbnVtIEVkaXRFdmVudCB7XG4gIEFERCA9ICc8Q1JFQVRFRD4nLFxuICBERUwgPSAnPERFTEVURUQ+JyxcbiAgQ0hHID0gJzxDSEFOR0VEPidcbn1cblxuLyoqXG4gKiBFZGl0IGV2ZW50IHF1ZXVlXG4gKi9cbmV4cG9ydCBjbGFzcyBFZGl0UXVldWUge1xuICBwcml2YXRlIGV2ZW50czogRWRpdEV2ZW50W107XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuXG4gIHB1c2goZTogRWRpdEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5ldmVudHMucHVzaChlKTtcbiAgfVxuXG4gIHJlZHVjZSgpOiBFZGl0RXZlbnQge1xuICAgIGxldCBjdXJyO1xuXG4gICAgaWYgKHRoaXMuZXZlbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5ldmVudHMubGVuZ3RoID09PSAxKSByZXR1cm4gdGhpcy5ldmVudHMucG9wKCk7XG5cbiAgICB3aGlsZSAodGhpcy5ldmVudHMubGVuZ3RoKSB7XG4gICAgICBsZXQgbmV4dCA9IHRoaXMuZXZlbnRzLnBvcCgpO1xuICAgICAgaWYgKCFjdXJyIHx8IGN1cnIgPT09IG5leHQgfHxcbiAgICAgICAgICBjdXJyID09PSBFZGl0RXZlbnQuQUREICYmIG5leHQgPT09IEVkaXRFdmVudC5DSEcgfHxcbiAgICAgICAgICBjdXJyID09PSBFZGl0RXZlbnQuQ0hHICYmIG5leHQgPT09IEVkaXRFdmVudC5ERUwpIHtcbiAgICAgICAgY3VyciA9IG5leHQ7XG4gICAgICB9XG4gICAgICBpZiAoY3VyciA9PT0gRWRpdEV2ZW50LkFERCAmJiBuZXh0ID09PSBFZGl0RXZlbnQuREVMIHx8XG4gICAgICAgICAgY3VyciA9PT0gRWRpdEV2ZW50LkRFTCAmJiBuZXh0ID09PSBFZGl0RXZlbnQuQUREKSB7XG4gICAgICAgIGN1cnIgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoY3VyciA9PT0gRWRpdEV2ZW50LkNIRyAmJiBuZXh0ID09PSBFZGl0RXZlbnQuQUREIHx8XG4gICAgICAgICAgY3VyciA9PT0gRWRpdEV2ZW50LkRFTCAmJiBuZXh0ID09PSBFZGl0RXZlbnQuQ0hHKSB7XG4gICAgICAgIFV0aWxzLndhcm4oYEJhZCBzdGF0ZSB0cmFuc2l0aW9uOiAke2N1cnJ9IC0+ICR7bmV4dH0uYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdXJyO1xuICB9XG59XG4iXX0=