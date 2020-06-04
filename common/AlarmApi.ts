import { Alarm, DayGroup, DaySelector } from "./models/Alarm";
import { Action } from "./models/Action";
import { cloneDeep } from "lodash";

export abstract class AlarmApi {
  abstract async getAlarms(): Promise<Alarm[]>;
  abstract async getDaySelectors(): Promise<DaySelector[]>;
  abstract async getDayGroups(): Promise<DayGroup[]>;
  abstract async getActions(): Promise<Action[]>;
  abstract async postAlarm(alarm: Alarm): Promise<Alarm[]>;
  abstract async postDaySelector(ds: DaySelector): Promise<DaySelector[]>;
  abstract async postDayGroup(dg: DayGroup): Promise<DayGroup[]>;
  abstract async postAction(action: Action): Promise<Action[]>;
  abstract async deleteAlarm(name: string): Promise<Alarm[]>;
  abstract async deleteDaySelector(name: string): Promise<DaySelector[]>;
  abstract async deleteDayGroup(name: string): Promise<DayGroup[]>;
  abstract async deleteAction(name: string): Promise<Action[]>;
}

export class AlarmApiWrapper {
  api: AlarmApi;
  alarms: Alarm[];
  daySelectors: DaySelector[];
  dayGroups: DayGroup[];
  actions: Action[];
  daySelectorsObj: { [key: string]: DaySelector };
  dayGroupsObj: { [key: string]: DayGroup };
  actionsObj: { [key: string]: Action };
  constructor(api: AlarmApi) {
    this.api = api;
    this.alarms = null;
    this.daySelectors = null;
    this.dayGroups = null;
    this.actions = null;
  }
  async init() {
    this.alarms = await this.api.getAlarms();
    this.daySelectors = await this.api.getDaySelectors();
    this.dayGroups = await this.api.getDayGroups();
    this.actions = await this.api.getActions();
    this.keyDaySelectors();
    this.keyDayGroups();
    this.keyActions();
    this.updateAlarms();
    this.fillDaySelectors();
    this.fillDayGroups();
    this.fillActions();
  }
  keyActions() {
    this.actionsObj = {};
    this.actions.forEach(action => {
      this.actionsObj[action.name] = action;
    });
  }
  keyDaySelectors() {
    this.daySelectorsObj = {};
    this.daySelectors.forEach(ds => {
      this.daySelectorsObj[ds.name] = ds;
    });
  }
  keyDayGroups() {
    this.dayGroupsObj = {};
    this.dayGroups.forEach(dg => {
      this.dayGroupsObj[dg.name] = dg;
    });
  }
  updateActions() {
    this.keyActions();
    this.fillActions();
    this.fillAlarmsActions();
  }
  updateDaySelectors() {
    this.keyDaySelectors();
    this.fillDaySelectors();
    this.fillDayGroups();
  }
  updateAlarms() {
    this.alarms.forEach(alarm => {
      alarm.action = this.actionsObj[alarm.action.name];
      const days = alarm.days;
      if (days.type !== 'day-group') return;
      days.group = this.dayGroupsObj[days.group.name];
    });
  }
  updateDayGroups() {
    this.keyDayGroups();
    this.fillDayGroups();
    this.fillAlarmsDayGroups();
  }
  fillAlarmsDayGroups() {
    this.alarms.forEach(alarm => {
      const days = alarm.days;
      if (days.type !== 'day-group') return;
      days.group = this.dayGroupsObj[days.group.name];
    });
  }
  fillAlarmsActions() {
    this.alarms.forEach(alarm => {
      alarm.action = this.actionsObj[alarm.action.name];
    });
  }
  fillActions() {
    this.actions.forEach(action => {
      if (action.type !== 'composite') return;
      action.subActions.forEach(subAction => {
        subAction.action = this.actionsObj[subAction.action.name];
      });
    });
  }
  fillDayGroups() {
    this.dayGroups.forEach(dg => {
      const days = dg.days;
      for (let i = 0; i < days.length; ++i) {
        days[i] = this.dayGroupsObj[days[i].name];
      }
    });
  }
  fillDaySelectors() {
    this.daySelectors.forEach(ds => {
      if (ds.type !== 'drtod') return;
      ds.relativeDay = this.daySelectorsObj[ds.relativeDay.name];
    });
  }
}

export class BasicAlarmApi extends AlarmApi {
  alarms: Alarm[];
  daySelectors: DaySelector[];
  dayGroups: DayGroup[];
  actions: Action[];
  constructor(alarms: Alarm[], daySelectors: DaySelector[], dayGroups: DayGroup[], actions: Action[]) {
    super();
    this.alarms = alarms;
    this.daySelectors = daySelectors;
    this.dayGroups = dayGroups;
    this.actions = actions;
  }
  async getAlarms(): Promise<Alarm[]> {
    return cloneDeep(this.alarms);
  }
  async getDaySelectors(): Promise<DaySelector[]> {
    return cloneDeep(this.daySelectors);
  }
  async getDayGroups(): Promise<DayGroup[]> {
    return cloneDeep(this.dayGroups);
  }
  async getActions(): Promise<Action[]> {
    return cloneDeep(this.actions);
  }
  async putAlarm(alarm: Alarm): Promise<Alarm[]> {
    alarm = {
      ...alarm,
      action: {
        name: alarm.name
      }
    };
    if (alarm.days.type === 'day-group') {
      alarm.days = {
        type: 'day-group',
        group: {
          name: alarm.days.group.name
        }
      };
    }
    const pos = this.alarms.findIndex(x => x.name === alarm.name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.alarms[-1] = alarm;
    return await this.getAlarms();
  }
  async putDaySelector(ds: DaySelector): Promise<DaySelector[]> {
    if (ds.type === 'drtod') {
      ds = {
        type: 'drtod',
        ...ds,
        relativeDay: {
          name: ds.relativeDay.name
        }
      };
    }
    const pos = this.daySelectors.findIndex(x => x.name === ds.name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.daySelectors[-1] = ds;
    return await this.getDaySelectors();
  }
  async putDayGroup(dg: DayGroup): Promise<DayGroup[]> {
    dg = {
      name: dg.name,
      days: dg.days.map(day => ({ name: day.name }))
    };
    const pos = this.dayGroups.findIndex(x => x.name === dg.name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.dayGroups[-1] = dg;
    return await this.getDayGroups();
  }
  async putAction(action: Action): Promise<Action[]> {
    if (action.type === 'composite') {
      action = {
        type: 'composite',
        ...action,
        subActions: action.subActions.map(subAction => ({
          action: {
            name: subAction.action.name
          },
          duration: subAction.duration
        }))
      }
    }
    const pos = this.actions.findIndex(x => x.name === action.name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.actions[-1] = action;
    return await this.getActions();
  }
  async postAlarm(alarm: Alarm): Promise<Alarm[]> {
    alarm = {
      ...alarm,
      action: {
        name: alarm.name
      }
    };
    if (alarm.days.type === 'day-group') {
      alarm.days = {
        type: 'day-group',
        group: {
          name: alarm.days.group.name
        }
      };
    }
    if (this.alarms.filter(x => x.name === alarm.name).length) {
      throw new Error('409 Conflict');
    }
    this.alarms.push(alarm);
    return await this.getAlarms();
  }
  async postDaySelector(ds: DaySelector): Promise<DaySelector[]> {
    if (ds.type === 'drtod') {
      ds = {
        type: 'drtod',
        ...ds,
        relativeDay: {
          name: ds.relativeDay.name
        }
      };
    }
    if (this.daySelectors.filter(x => x.name === ds.name).length) {
      throw new Error('409 Conflict');
    }
    this.daySelectors.push(ds);
    return await this.getDaySelectors();
  }
  async postDayGroup(dg: DayGroup): Promise<DayGroup[]> {
    dg = {
      name: dg.name,
      days: dg.days.map(day => ({ name: day.name }))
    };
    if (this.dayGroups.filter(x => x.name === dg.name).length) {
      throw new Error('409 Conflict');
    }
    this.dayGroups.push(dg);
    return await this.getDayGroups();
  }
  async postAction(action: Action): Promise<Action[]> {
    if (action.type === 'composite') {
      action = {
        type: 'composite',
        ...action,
        subActions: action.subActions.map(subAction => ({
          action: {
            name: subAction.action.name
          },
          duration: subAction.duration
        }))
      }
    }
    if (this.actions.filter(x => x.name === action.name).length) {
      throw new Error('409 Conflict');
    }
    this.actions.push(action);
    return await this.getActions();
  }
  async deleteAlarm(name: string): Promise<Alarm[]> {
    const pos = this.alarms.findIndex(x => x.name === name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.alarms.splice(pos, 1);
    return await this.getAlarms();
  }
  async deleteDaySelector(name: string): Promise<DaySelector[]> {
    const pos = this.daySelectors.findIndex(x => x.name === name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.daySelectors.splice(pos, 1);
    return await this.getDaySelectors();
  }
  async deleteDayGroup(name: string): Promise<DayGroup[]> {
    const pos = this.dayGroups.findIndex(x => x.name === name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.dayGroups.splice(pos, 1);
    return await this.getDayGroups();
  }
  async deleteAction(name: string): Promise<Action[]> {
    const pos = this.actions.findIndex(x => x.name === name);
    if (pos === -1) {
      throw new Error('404 Not Found');
    }
    this.actions.splice(pos, 1);
    return await this.getActions();
  }
}
