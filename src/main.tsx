import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Tab, Tabs, Snackbar } from '@material-ui/core';
import { Dashboard } from './ui/dashboard';
import { Alarms } from './ui/Alarms';
import { Alarm, DayGroup, DaySelector } from '../common/models/Alarm';
import DateFnsUtils from '@date-io/date-fns';
import DashboardIcon from '@material-ui/icons/Dashboard';
import StarIcon from '@material-ui/icons/Star';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import EventIcon from '@material-ui/icons/Event';
import DateRangeIcon from '@material-ui/icons/DateRange';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DayGroups } from './ui/DayGroups';
import { DaySelectors } from './ui/Days';
import { AlarmApi, AlarmApiWrapper, BasicAlarmApi } from '../common/AlarmApi';
import { Action } from '../common/models/Action';
import { Actions } from './ui/Actions';

function tabProps(idx: number) {
  return {
    id: `action-tab-${idx}`,
    'aria-controls': `action-tabpanel-${idx}`
  };
}
function tabPanelProps(currentTab: number, idx: number) {
  return {
    hidden: currentTab !== idx,
    id: `action-tabpanel-${idx}`,
    'aria-labelledby': `action-tab-${idx}`
  };
}

const alarms: Alarm[] = [
  {
    type: 'basic',
    action: {
      name: 'hello'
    },
    days: {
      type: 'dow',
      daysOfWeek: [false, true, true, true, true, true, false]
    },
    hour: 8,
    negateAction: false,
    priority: 0,
    isPM: false,
    minute: 30,
    name: 'first alarm'
  },
  {
    type: 'basic',
    action: {
      name: 'hello'
    },
    days: {
      type: 'dow',
      daysOfWeek: [false, true, true, true, true, true, false]
    },
    hour: 9,
    negateAction: false,
    priority: 0,
    isPM: false,
    minute: 30,
    name: 'second alarm'
  },
  {
    type: 'basic',
    action: {
      name: 'hello'
    },
    days: {
      type: 'dow',
      daysOfWeek: [false, true, true, true, true, true, false]
    },
    hour: 10,
    negateAction: false,
    priority: 0,
    isPM: false,
    minute: 0,
    name: 'standup alarm'
  }
];

const daySelectors: DaySelector[] = [
  {
    name: 'New Years Day',
    type: 'exact-date',
    month: 0,
    day: 0
  },
  {
    name: 'Martin Luther King Jr. Day',
    type: 'ndowom',
    month: 0,
    dayOfWeek: 1,
    n: 2
  },
  {
    name: "Washington's Birthday",
    type: 'ndowom',
    month: 1,
    dayOfWeek: 1,
    n: 2
  },
  {
    name: 'Good Friday',
    type: 'drtod',
    relativeDay: {
      name: 'Easter Sunday'
    },
    daysRelative: -2
  },
  {
    name: 'Easter Sunday',
    type: 'dowafmadom',
    dayOfWeekAfterFullMoon: 0,
    startMonth: 2,
    startDay: 20
  },
  {
    name: 'Memorial Day',
    type: 'ndowom',
    month: 4,
    dayOfWeek: 1,
    n: -1
  },
  {
    name: 'Independence Day',
    type: 'exact-date',
    month: 6,
    day: 3
  },
  {
    name: 'Independence Day Observed',
    type: 'dmboowd',
    month: 6,
    day: 3
  },
  {
    name: 'Labor Day',
    type: 'ndowom',
    dayOfWeek: 1,
    month: 8,
    n: 0
  },
  {
    name: 'Veterans Day',
    type: 'exact-date',
    month: 10,
    day: 10
  },
  {
    name: 'Thanksgiving Day',
    type: 'ndowom',
    dayOfWeek: 4,
    month: 10,
    n: 3
  },
  {
    name: 'Black Friday',
    type: 'drtod',
    relativeDay: {
      name: 'Thanksgiving Day'
    },
    daysRelative: 1
  },
  {
    name: 'Christmas Eve',
    type: 'exact-date',
    month: 11,
    day: 23
  },
  {
    name: 'Christmas Observed',
    type: 'dmboowd',
    month: 11,
    day: 24
  },
  {
    name: 'Christmas',
    type: 'exact-date',
    month: 11,
    day: 24
  }
];

const dayNameToObj: { [key: string]: DaySelector } = {};
daySelectors.forEach(ds => {
  dayNameToObj[ds.name] = ds;
});
daySelectors.forEach(ds => {
  if (ds.type === 'drtod') {
    ds.relativeDay = dayNameToObj[ds.relativeDay.name];
  }
});

const dayGroups: DayGroup[] = [
  {
    name: 'NYSE holidays',
    days: [daySelectors[0], daySelectors[1], daySelectors[2], daySelectors[3], daySelectors[5], daySelectors[7], daySelectors[8], daySelectors[10], daySelectors[13]]
  }
];

const actions: Action[] = [
  {
    type: 'gpio-set',
    name: 'alarm on',
    description: 'turns alarm pin on',
    pin: 0,
    value: true
  },
  {
    type: 'gpio-set',
    name: 'alarm off',
    description: 'turns alarm pin off',
    pin: 0,
    value: false
  },
  {
    type: 'composite',
    name: 'hello',
    description: 'triggers alarm on then off',
    subActions: [
      {
        action: {
          name: 'alarm on'
        },
        duration: 250
      },
      {
        action: {
          name: 'alarm off'
        },
        duration: 250
      }
    ]
  }
];

interface CommonProps {
}

interface Props extends CommonProps {
  api: AlarmApiWrapper
};

interface State extends CommonProps {
  currentTab: number;
  alarms: Alarm[];
  daySelectors: DaySelector[];
  dayGroups: DayGroup[];
  actions: Action[];
  snackState: 'none' | 'error' | 'success';
  snackMsg: string;
};

class ReactApp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 1,
      alarms: [],
      daySelectors: [],
      dayGroups: [],
      actions: [],
      snackState: 'none',
      snackMsg: ''
    };
  }
  async componentDidMount() {
    const { api } = this.props;
    await api.init();
    this.setState({
      alarms: api.alarms,
      daySelectors: api.daySelectors,
      dayGroups: api.dayGroups,
      actions: api.actions
    });
  }
  render() {
    const { api } = this.props;
    const { currentTab, alarms, daySelectors, dayGroups, actions, snackState, snackMsg } = this.state;
    return (
      <div>
        <AppBar position="sticky" color="primary" className="responsive-large">
          <Tabs value={currentTab} onChange={(evt, idx) => this.setState({ currentTab: idx })}>
            <Tab label="Coffee Dashboard" icon={<DashboardIcon />} {...tabProps(0)} />
            <Tab label="Actions" icon={<StarIcon />} {...tabProps(1)} />
            <Tab label="Alarms" icon={<AccessAlarmIcon />} {...tabProps(2)} />
            <Tab label="Day Groupings" icon={<DateRangeIcon />} {...tabProps(3)} />
            <Tab label="Days" icon={<EventIcon />} {...tabProps(4)} />
          </Tabs>
        </AppBar>
        <AppBar position="sticky" color="primary" className="responsive-small">
          <Tabs value={currentTab} onChange={(evt, idx) => this.setState({ currentTab: idx })}>
            <Tab icon={<DashboardIcon />} {...tabProps(0)} />
            <Tab icon={<StarIcon />} {...tabProps(1)} />
            <Tab icon={<AccessAlarmIcon />} {...tabProps(2)} />
            <Tab icon={<DateRangeIcon />} {...tabProps(3)} />
            <Tab icon={<EventIcon />} {...tabProps(4)} />
          </Tabs>
        </AppBar>
        <div {...tabPanelProps(currentTab, 0)}><Dashboard /></div>
        <div {...tabPanelProps(currentTab, 1)}><Actions
          actions={actions}
          onCreateAction={async (action) => {
            try {
              await api.api.postAction(action);
              this.setState(await api.getActions());
            } catch (exc) {
              this.setState({
                snackMsg: 'failed to create new action: ' + exc,
                snackState: 'error'
              });
              return false;
            }
            this.setState({
              snackMsg: 'created action named: ' + action.name,
              snackState: 'success'
            });
            return true;
          }}
          onEditAction={async (action) => {
            try {
            await api.api.putAction(action);
            this.setState(await api.getActions());
            } catch (exc) {
              this.setState({
                snackMsg: 'failed to change action: ' + exc,
                snackState: 'error'
              });
              return false;
            }
            this.setState({
              snackMsg: 'changed action named: ' + action.name,
              snackState: 'success'
            });
            return true;
          }}
        /></div>
        <div {...tabPanelProps(currentTab, 2)}><Alarms
          alarms={alarms}
          dayGroups={dayGroups}
          actions={actions}
          onCreateAlarm={
            async (alarm) => {
              try {
                await api.api.postAlarm(alarm);
                this.setState(await api.getAlarms());
              } catch (exc) {
                this.setState({
                  snackState: 'error',
                  snackMsg: '' + exc
                });
                return false;
              }
              this.setState({
                snackState: 'success',
                snackMsg: 'created alarm named: ' + alarm.name
              });
              return true;
            }
          }
          onEditAlarm={
            async (alarm) => {
              try {
                await api.api.putAlarm(alarm);
                this.setState(await api.getAlarms());
              } catch (exc) {
                this.setState({
                  snackState: 'error',
                  snackMsg: 'failed' + exc
                });
                return false;
              }
              this.setState({
                snackState: 'success',
                snackMsg: 'changed alarm named: ' + alarm.name
              });
              return true;
            }
          }
        /></div>
        <div {...tabPanelProps(currentTab, 3)}><DayGroups
          dayGroups={dayGroups}
        /></div>
        <div {...tabPanelProps(currentTab, 4)}><DaySelectors
          daySelectors={daySelectors}
        /></div>
        <Snackbar
          open={snackState === 'error'}
          onClose={() => (this.setState({ snackState: 'none' }))}
          message={snackMsg} />
        <Snackbar
          open={snackState === 'success'}
          onClose={() => (this.setState({ snackState: 'none' }))}
          message={snackMsg} />
      </div>
    );
  }
}

function Wrapper(props) {
  return <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <ReactApp api={new AlarmApiWrapper(new BasicAlarmApi(alarms, daySelectors, dayGroups, actions))} />
  </MuiPickersUtilsProvider>
}

console.log('hello world');

document.addEventListener('DOMContentLoaded', function () {
  const div = document.getElementById('container') as HTMLDivElement;
  render(<Wrapper />, div);
});
