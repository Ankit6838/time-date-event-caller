import React, { FC, useState } from 'react';
import * as angular from 'angular';
import { react2angular } from 'react2angular';
import _ from 'lodash';
import { useMilitaryFormat, timeDelim } from '../../Services/NonAngular/DateTime';
import '../../../Css/octimepicker.less';
import { needStrings, getString } from '../../Services/NonAngular/LocalizedStrings';
import { Button } from './Button';

export interface IOcTimePickerProps {
    time: Date;
    disabled?: boolean;
    minTime?: Date;
    maxTime?: Date;
    update: (newTime: Date) => void;
}

export const OcTimePicker: FC<IOcTimePickerProps> = (props: IOcTimePickerProps) => {
    const { time, disabled, minTime, maxTime, update } = props;

    const [AMString, setAMstring] = useState<string>(null);
    const [PMString, setPMstring] = useState<string>(null);

    const hasDate = _.isDate(time);
    let dateTime: Date;

    needStrings(['TIME_AM']).then(() => {
        setAMstring(getString('TIME_AM'));
    });

    needStrings(['TIME_PM']).then(() => {
        setPMstring(getString('TIME_PM'));
    });

    if (hasDate) {
        dateTime = time;
    } else {
        dateTime = new Date();
        dateTime.setHours(0);
        dateTime.setMinutes(0);
    }

    const useMilitaryDateTimeFormat =
        typeof useMilitaryFormat !== 'undefined' ? useMilitaryFormat : false;

    const fullHours = dateTime.getHours();
    let displayHours = dateTime.getHours();
    const mins = dateTime.getMinutes();
    const showAmPm = !useMilitaryDateTimeFormat;
    const isPm = showAmPm && displayHours >= 12;
    if (isPm) {
        displayHours -= 12;
    }

    if (showAmPm && displayHours === 0) {
        displayHours = 12;
    }

    let formattedHours = displayHours.toString();
    if (formattedHours.length === 1) {
        formattedHours = `0${formattedHours}`;
    }

    let formattedMins = mins.toString();
    if (formattedMins.length === 1) {
        formattedMins = `0${formattedMins}`;
    }

    const setHours = (e: React.ChangeEvent<HTMLInputElement>) => {
        let d = new Date(dateTime);
        // if the inputed/new value is defined and not null,
        // set the hours based on this new value
        if (!!e.target.value) {
            const hrs =
                !useMilitaryDateTimeFormat && parseInt(e.target.value) === 13
                    ? 1
                    : parseInt(e.target.value);

            if (
                (isPm && displayHours === 12 && hrs === 11) ||
                (!isPm && displayHours === 12 && hrs === 1)
            ) {
                d.setHours(hrs);
            } else if (isPm && displayHours === 12 && hrs === 1) {
                d.setHours(hrs + 12);
            } else if (!isPm && !useMilitaryDateTimeFormat && displayHours === 12 && hrs === 11) {
                d.setHours(d.getHours() - 1);
            } else if (useMilitaryDateTimeFormat || !isPm) {
                d.setHours(hrs);
            } else {
                d.setHours(hrs + 12);
            }
        }
        // else, zero out the hours
        else {
            d.setHours(0);
        }
        update(d);
    };

    const setMins = (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = new Date(dateTime);
        // if the inputed/new value is defined and not null,
        // set the minutes based on this new value
        if (!!e.target.value) {
            d.setMinutes(parseInt(e.target.value));
        }
        // else, zero out the minutes
        else {
            d.setMinutes(0);
        }
        update(d);
    };

    const toggleAmPm = () => {
        const d = new Date(dateTime);
        if (isPm) {
            d.setHours(fullHours - 12);
        } else if (displayHours !== 12 || (displayHours === 12 && !useMilitaryDateTimeFormat)) {
            d.setHours(displayHours + 12);
        } else {
            d.setHours(0);
        }
        update(d);
    };

    let minHours = useMilitaryDateTimeFormat ? -1 : 0;
    if (minTime?.getDate() === dateTime.getDate() && minTime?.getMonth() === dateTime.getMonth()) {
        minHours = useMilitaryDateTimeFormat
            ? minTime.getHours()
            : minTime.getHours() - (isPm ? 12 : 0);
    }

    let minMinutes = -1;
    if (minTime?.getDate() === dateTime.getDate() && minTime?.getMonth() === dateTime.getMonth()) {
        minMinutes = minTime.getMinutes();
    }

    let maxHours = useMilitaryDateTimeFormat ? 24 : 13;
    if (maxTime?.getDate() === dateTime.getDate() && maxTime?.getMonth() === dateTime.getMonth()) {
        maxHours = useMilitaryDateTimeFormat
            ? maxTime.getHours()
            : maxTime.getHours() - (isPm ? 12 : 0);
    }

    let maxMinutes = 60;
    if (maxTime?.getDate() === dateTime.getDate() && maxTime?.getMonth() === dateTime.getMonth()) {
        maxMinutes = maxTime.getMinutes();
    }

    const onFocusSelectText = event => event.target.select();

    const handleEnterKey = event => {
        // if Enter on keyboard is used, tab to the next element
        if (event.charCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            const tabToNextField = new KeyboardEvent('keydown', { code: '9' });
            event.target.dispatchEvent(tabToNextField);
        }
    };

    return (
        <div className={`flex-row oc-timepicker${hasDate ? '' : ' initial-state'}`}>
            <input
                className="cd-tabbable"
                type="number"
                min={minHours}
                max={
                    parseInt(formattedMins) > maxMinutes &&
                    parseInt(formattedHours, 10) === maxHours - 1
                        ? maxHours - 1
                        : maxHours
                }
                value={formattedHours}
                onChange={setHours}
                onKeyPress={handleEnterKey}
                onFocus={onFocusSelectText}
                onClick={onFocusSelectText}
                disabled={disabled ?? false}
                tabIndex={1000}
            />
            <span className="oc-timepicker-delim">{timeDelim}</span>
            <input
                className="cd-tabbable"
                type="number"
                min={minMinutes}
                max={parseInt(formattedHours, 10) === maxHours ? maxMinutes : 60}
                value={formattedMins}
                onChange={setMins}
                onFocus={onFocusSelectText}
                onClick={onFocusSelectText}
                disabled={disabled ?? false}
                tabIndex={1000}
            />
            {!useMilitaryDateTimeFormat && (
                <div className="flex-row">
                    <Button
                        className={`${isPm ? 'am-pm-button' : 'am-pm-selected'}`}
                        title={AMString}
                        disabled={disabled ?? false}
                        onClick={() => toggleAmPm()}>
                        {AMString}
                    </Button>
                    <Button
                        className={`${isPm ? 'am-pm-selected' : 'am-pm-button'}`}
                        title={PMString}
                        disabled={disabled ?? false}
                        onClick={() => toggleAmPm()}>
                        {PMString}
                    </Button>
                </div>
            )}
        </div>
    );
};

angular
    .module('main')
    .component(
        'ocTimePicker',
        react2angular(OcTimePicker, ['time', 'update', 'minTime', 'maxTime', 'disabled'])
    );
