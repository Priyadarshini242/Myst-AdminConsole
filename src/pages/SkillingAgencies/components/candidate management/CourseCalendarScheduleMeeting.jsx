import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CalendarComponent from '../../../../components/Calendar/CalendarComponent';
import "./CalendarScheduleMeeting.css";
import { emptyCalendarCourseData } from '../../../../reducer/skilling agency/course data/courseDataSlice';
import { getAccountDetails,UserDetailsApi } from "../../../../api/auth/getAccountDetails";
import { BASE_URL } from "../../../../config/Properties";
import timezones from "timezone-abbreviations";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import useContentLabel from "../../../../hooks/useContentLabel";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { getCookie } from '../../../../config/cookieService';
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment-timezone'
import { Card } from 'react-bootstrap';
import MeetingModal from '../../../../components/Calendar/MeetingModal';
import { setIsApiLoading } from '../../../../reducer/loading/isApiLoadingSlice';
import ViewMeetingModal from '../../../../components/Calendar/ViewMeetingModal';
import LogoLoader from '../../../../components/LogoLoader';

const CALENDAR_API_URL = process.env.REACT_APP_CALENDAR_API_URL;

const CourseCalendarScheduleMeeting = ({row }) => {
 
 const {calendarCourseData} = useSelector(state => state.myCourses);
 const userDetails = useSelector((state) => state.userProfile.data);
 const contentLabel = useContentLabel();
   const { search } = useLocation(); // Get search params from the URL
   const queryParams = new URLSearchParams(search); // Parse the query params
     

  const dummySkillSeekers=[{ id: '1', name: userDetails[0]?.firstName, email: getCookie("userName"), timezone: 'America/New_York', type: 'skill_Agency'}]
  const dummySkillOwners=[{id: '1', name: calendarCourseData?.firstName, email: calendarCourseData?.email}]

 const dispatch = useDispatch();
  const [agencyTimezone,setAgencyTimezone] = useState("Asia/Kolkata");
  const [ownerTimezone,setOwnerTimezone] = useState("Asia/Kolkata");
  const skillSeekerEmployees = dummySkillSeekers.filter(e => e.type === 'skill_Agency');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(skillSeekerEmployees[0]?.id || '');
  const handleEmployeeChange = (newEmployeeId) => {setSelectedEmployeeId(newEmployeeId); };
  const [allEvents, setAllEvents] = useState([]);
  const [accessToken, setAccessTokenState] = useState();
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalStart, setGlobalStart] = useState('');
  const [globalEnd, setGlobalEnd] = useState('');
  const [globalAttendees, setGlobalAttendees] = useState('');
  const [globalExtraAttendee, setGlobalExtraAttendee] = useState('');
  const [globalDescription, setGlobalDescription] = useState('');
  const [isGlobalModalLoading, setIsGlobalModalLoading] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [globalAddMeetLink, setGlobalAddMeetLink] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);
 
  const [agenecyMail, setAgenecyMail] = useState([userDetails[0]?.accountId]);
  const [ownnerMail, setOwnnerMail] = useState([calendarCourseData?.email]);
  const regionalData = useSelector((state) => state.regionalData);
  const [isLoading, setIsLoading] = useState(true);
  const [userabbr,setUserAbbr]=useState("");
  const [adminabbr,setAdminAbbr]=useState("");
  const navigate = useNavigate()
  const setAccessToken = (token) => {
    setAccessTokenState(token);  
};

function findTimezonesByOffset(targetOffsetMinutes) {
  const now = Date.now();
  const zones = moment.tz.names();
  return zones.filter(zone => {
    return moment.tz(now, zone).utcOffset() === targetOffsetMinutes;
  });
}

function parseOffsetToMinutes(offsetStr) {
  const match = offsetStr.match(/UTC([+-])(\d{2}):?(\d{2})?/);
  if (!match) return null;
  const sign = match[1] === '+' ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] || '0', 10);
  return sign * (hours * 60 + minutes);
}




   const isGetAccessToke = async () => {
    const method = "GET";
    const token = getCookie("token");

    try {
      const response = await fetch(`${BASE_URL}/skill/get-token`, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json(); // assuming response returns JSON

      if (data?.access_token) {
        setAccessToken(data.access_token);       
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  //Get Account Details
   const AccountDetails = async (accountId,isValue) => {
    if(!accountId) return
   const account=await getAccountDetails(accountId);  

   const getTime= timezones.find(tz => tz.abbr === account?.data?.account?.homeTimeZone)
   const offsetMinutes = parseOffsetToMinutes(getTime?.offset);
   const matchedZones = findTimezonesByOffset(offsetMinutes);

   fetch(`${BASE_URL}/skill/api/v1/skills/get-all-user-data/User_Details/${accountId}?authToken=${getCookie("token")}`)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);   
    return res.json();
  })
  .then(data => {
        const uniqueEmails =isValue? agenecyMail:[...ownnerMail,account?.data?.account?.accountId];

data.forEach(item => {
  const email = item.email?.trim(); // optional chaining & clean whitespace
  if (email && !uniqueEmails.includes(email)) {
    uniqueEmails.push(email);
  }
});

const uniqueEmails_ = [...new Set(uniqueEmails.map(e => e.trim()))]

if(isValue){
    setAgenecyMail(uniqueEmails_);
   
    setAdminAbbr(account?.data?.account?.homeTimeZone);
    
    setGlobalAttendees(uniqueEmails_.join(','))
}else{
setOwnnerMail(uniqueEmails_);
 setUserAbbr(account?.data?.account?.homeTimeZone)
  setGlobalExtraAttendee(uniqueEmails_.join(','))
}
  })
  .catch(err => {
    console.error("Error fetching agency profile data:", err);
  });

if(isValue){
 setAgencyTimezone(matchedZones?.[0])
   
}else{
   setOwnerTimezone(matchedZones?.[0])
}
  }


//
useEffect(() => {
  const fetchData = async () => {
    await isGetAccessToke();
    await AccountDetails(userDetails[0]?.accountId,true);
    await AccountDetails(calendarCourseData?.account?.accountId,false);   
    setIsLoading(false)
    
  };
  if(!userDetails[0]?.accountId){
    return
  }
  fetchData();
}, [calendarCourseData, userDetails]);

  const selectedEmployee = dummySkillSeekers.find((e) => e.id === selectedEmployeeId);
  //const employeeTimezone = selectedEmployee?.timezone || adminTimezone;

  const fetchEvents = async () => {
    
    if (!accessToken || !selectedEmployee?.email) {
      setAllEvents([]);
      return;
    }

    dispatch(setIsApiLoading(true));
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const url = `${CALENDAR_API_URL}/calendars/primary/events?timeMin=${oneWeekAgo.toISOString()}&timeMax=${oneMonthFromNow.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=250&showDeleted=false`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      });
      if (response.status === 401 || response.status === 403) {
        setAccessToken(null);
       // alert('Session expired. Please sign in again.');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setAllEvents(data.items || []);
      } else {
        setAllEvents([]);
      }
       dispatch(setIsApiLoading(false));
    } catch (error) {
      setAllEvents([]);
       dispatch(setIsApiLoading(false));
    }
  };


  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [accessToken]);

  
  const filteredEvents = allEvents
    .filter(ev => {
      if (!selectedEmployee?.email) return false;
      const hasAttendee = ev.attendees && ev.attendees.some(a => a.email === selectedEmployee.email);
      return hasAttendee;
    })
    .map(ev => ({
      title: ev.summary,
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
      description: ev.description,
      attendees: ev.attendees,
      id: ev.id,
      extendedProps: {
        description: ev.description,
        attendees: ev.attendees,
        hangoutLink: ev.hangoutLink,
        conferenceData: ev.conferenceData,
      }
    }));
  const eventsToShow = filteredEvents;

  // Open modal for new meeting
  const openNewMeetingModal = () => {
    setIsEditingEvent(false);
    setEditingEventId(null);
    setGlobalTitle(`Meeting between ${selectedEmployee?.name || 'Skill Seeker'} and ${dummySkillOwners[0]?.name || 'Skill Owner'}`);
    setGlobalStart('');
    setGlobalEnd('');
    setGlobalDescription('');
    setGlobalAttendees(agenecyMail? agenecyMail?.join(", "):"");
    setGlobalExtraAttendee(ownnerMail?ownnerMail?.join(", "):"");
    setGlobalAddMeetLink(false);
    setShowGlobalModal(true);
    setEventCreated(false);
  };

  // Open modal for editing
  const handleEventClick = (eventInfo) => {
    const event = eventInfo.event;
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    // Defensive: ensure startDate and endDate are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setIsEditingEvent(true);
      setEditingEventId(event.id);
      setGlobalTitle(event.title || '');
      setGlobalStart('');
      setGlobalEnd('');
      setGlobalDescription(event.extendedProps?.description || '');
      setGlobalAttendees(agenecyMail? agenecyMail?.join(", "):"");
      setGlobalExtraAttendee(ownnerMail?ownnerMail?.join(", "):"");
      setGlobalAddMeetLink(false);
      setShowGlobalModal(true);
      setEventCreated(false);
      return;
    }

    // Format start & end in admin timezone
    const startTime = moment(event.start).tz(agencyTimezone).format("YYYY-MM-DDTHH:mm");
    const endTime = moment(event.end).tz(agencyTimezone).format("YYYY-MM-DDTHH:mm");

    setIsEditingEvent(true);
    setEditingEventId(event.id);
    const existingAttendees = event.extendedProps?.attendees || [];
    const userEmails = dummySkillOwners.map(user => user.email);
    const skillSeekerEmails = existingAttendees
      .map(a => a.email)
      .filter(email => agenecyMail.includes(email));
      
    const skillOwnerEmail = existingAttendees
      .map(a => a.email)
      .filter(email => !agenecyMail.includes(email));
    setGlobalTitle(event.title);
    setGlobalStart(startTime);
    setGlobalEnd(endTime);
    setGlobalDescription(event.extendedProps?.description || '');
    setGlobalAttendees(skillSeekerEmails?.join(', '));
    setGlobalExtraAttendee(skillOwnerEmail?.join(', '));
    const ext = event.extendedProps || {};
    const hasMeetLink =
      !!ext.hangoutLink ||
      (ext.conferenceData &&
       ext.conferenceData.entryPoints &&
       ext.conferenceData.entryPoints.some(ep => ep.entryPointType === 'video'));
    setGlobalAddMeetLink(hasMeetLink);
    setShowGlobalModal(true);
    setEventCreated(false);
  };

  // Open modal for slot click (new meeting with prefilled time)
  const handleSlotClick = (slotInfo) => {
  // Format start & end in admin timezone
  const startTime = moment(slotInfo?.start, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DDTHH:mm");
  const defaultEndTime = moment(slotInfo?.end, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DDTHH:mm");

  setIsEditingEvent(false);
  setEditingEventId(null);
  setGlobalTitle(
    `Meeting between ${selectedEmployee?.name || 'Skill Seeker'} and ${
      dummySkillOwners[0]?.name || 'Skill Owner'
    }`
  );
  setGlobalStart(startTime);
  setGlobalEnd(defaultEndTime);
  setGlobalDescription('');
  setGlobalAttendees(agenecyMail ? agenecyMail.join(",") : "");
  setGlobalExtraAttendee(ownnerMail ? ownnerMail.join(",") : "");
  setGlobalAddMeetLink(false);
  setShowGlobalModal(true);
  setEventCreated(false);
  };

  const closeGlobalModal = () => {
    setShowGlobalModal(false);
    setGlobalTitle('');
    setGlobalStart('');
    setGlobalEnd('');
    setGlobalAttendees('');
    setGlobalExtraAttendee('');
    setGlobalDescription('');
    setIsEditingEvent(false);
    setEditingEventId(null);
    setGlobalAddMeetLink(false);
    setEventCreated(false);
  };

  
    function formatWithTimezone(input, tz) {
      // Parse input as a naive datetime
      const m = moment.tz(input, "YYYY-MM-DDTHH:mm", tz);
      // Format as full ISO with offset
      return m.format("YYYY-MM-DDTHH:mm:ssZ");
    }
  

  // Unified create/update meeting handler
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    
    // setIsGlobalModalLoading(true);
    const title = globalTitle;
    const start = globalStart;
    const end = globalEnd;
    const attendees = globalAttendees;
    const extraAttendee = globalExtraAttendee;
    const description = globalDescription;
    const emails = new Set();
    if (selectedEmployee?.email) {
      emails.add(selectedEmployee.email);
    }
    if (attendees) {
      attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email !== selectedEmployee?.email)
        .forEach(email => emails.add(email));
    }
    if (extraAttendee) {
      extraAttendee
        .split(',')
        .map(email => email.trim())
        .forEach(email => emails.add(email));
    }

[...(agenecyMail || []), ...(ownnerMail || [])].forEach(mail => {
  const trimmed = mail?.trim();
  if (trimmed && !emails.has(trimmed)) {
    if(!isEditingEvent){
      emails.add(trimmed);
    }else{

    }
  }
});

const emailssets = Array.from(emails);
const uniqueEmails = [...new Set(
  emailssets.flatMap(str => str.split(',').map(e => e.trim()))
)];


  
    const event = {
      summary: title,
      description,
      start: {
        dateTime: formatWithTimezone(start,agencyTimezone),
        timeZone: agencyTimezone || 'Asia/Kolkata',
      },
      end: {
        dateTime: formatWithTimezone(end,agencyTimezone),
        timeZone: agencyTimezone || 'Asia/Kolkata',
      },
      attendees: Array.from(uniqueEmails).map(email => ({ email })),
    };


    if (globalAddMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }

     setIsGlobalModalLoading(true);
    try {
      const url = isEditingEvent 
        ? `${CALENDAR_API_URL}/calendars/primary/events/${editingEventId}${globalAddMeetLink ? '?conferenceDataVersion=1' : ''}`
        : `${CALENDAR_API_URL}/calendars/primary/events${globalAddMeetLink ? '?conferenceDataVersion=1' : ''}`;
      const method = isEditingEvent ? 'PUT' : 'POST';
      const token = getCookie("token");
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      if (response.status === 401 || response.status === 403) {
        setAccessToken(null);
       // alert('Session expired. Please sign in again.');
        return;
      }
      if (response.ok) {
        isEditingEvent ? showSuccessToast(contentLabel("ScheduleUpdateSuccessfully", "nf Schedule Update Successfully")) : showSuccessToast(contentLabel("ScheduleCreateSuccessfully", "nf Schedule Create Successfully"));

        setEventCreated(true);
        closeGlobalModal();
         navigate(
         `/skilling-agency/candidate-management?id=${queryParams.get("id")}`,
        { replace: true }
      );
        setTimeout(() => {
          fetchEvents();
        }, 1000);
      } else {
        const errorData = await response.json();
        //alert(`Failed to create meeting: ${errorData.error?.message || 'Unknown error'}`);
         showErrorToast(`Failed to create meeting: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      //alert(`Error creating meeting: ${error.message}`);
       setIsGlobalModalLoading(false);
       dispatch(setIsApiLoading(false));
    } finally {
      setIsGlobalModalLoading(false);
        dispatch(setIsApiLoading(false));
    }
  };
const handleClickClose=()=>{
dispatch(emptyCalendarCourseData({}));
navigate(`/skilling-agency/candidate-management?id=${queryParams.get("id")}`)
}

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    const navType =
      navEntries.length > 0 ? navEntries[0].type : performance.navigation.type;

    const hasVisited = sessionStorage.getItem("visited");

    if (navType === "reload" && hasVisited) {
      sessionStorage.removeItem("visited"); // reset immediately after redirect
      navigate(
         `/skilling-agency/candidate-management?id=${queryParams.get("id")}`,
        { replace: true }
      );
    } else {
      sessionStorage.setItem("visited", "true");
    }

    // 🔑 Cleanup when leaving/unmounting the route
    return () => {
      sessionStorage.removeItem("visited");
    };
  }, [navigate]);


if(agencyTimezone === undefined || ownerTimezone === undefined){
    console.log(`Failed to retrieve the time zone.`);
}

  return (
    <div 
    // className='app-calendar-container'
    > 
    {isLoading ? 
        <Card style={{ minHeight: 'calc(var(--cardBodyWithB-F) + 12vh)'}} className='h-100 d-flex justify-content-center align-items-center' >
          {/* <span
            className="spinner-border text-primary-color spinner-lg"
            role="status"
            aria-hidden="true"
          /> */}
             <LogoLoader/>
        </Card>
             
                :
       
       ( <div>
      <CalendarComponent
        events={eventsToShow}
        adminTimezone={agencyTimezone}
        userTimezone={ownerTimezone}
        adminName="Admin"
        employeeName={selectedEmployee?.name}
        onEventClick={handleEventClick}
        onSlotClick={handleSlotClick}
        handleClickClose={handleClickClose}
        openNewMeetingModal={openNewMeetingModal}
        skillseekeragnecy={userDetails[0]?.firstName}
        skillowner={calendarCourseData?.firstName}
        isDashboard={false}
        adminAbbr={adminabbr}
        userAbbr={userabbr}
        userRole = {getCookie("USER_ROLE")}
      />
    {
        isEditingEvent ?
        <ViewMeetingModal
            show={showGlobalModal}
            onHide={closeGlobalModal}
            isEditingEvent={isEditingEvent}
            handleMeetingSubmit={handleMeetingSubmit}
            globalTitle={globalTitle}
            setGlobalTitle={setGlobalTitle}
            globalStart={globalStart}
            setGlobalStart={setGlobalStart}
            globalEnd={globalEnd}
            setGlobalEnd={setGlobalEnd}
            globalAttendees={globalAttendees}
            setGlobalAttendees={setGlobalAttendees}
            globalExtraAttendee={globalExtraAttendee}
            setGlobalExtraAttendee={setGlobalExtraAttendee}
            globalDescription={globalDescription}
            setGlobalDescription={setGlobalDescription}
            globalAddMeetLink={globalAddMeetLink}
            setGlobalAddMeetLink={setGlobalAddMeetLink}
            isGlobalModalLoading={isGlobalModalLoading}
            userRole = {getCookie("USER_ROLE")}
          />

          :

          <MeetingModal
            show={showGlobalModal}
            onHide={closeGlobalModal}
            isEditingEvent={isEditingEvent}
            handleMeetingSubmit={handleMeetingSubmit}
            globalTitle={globalTitle}
            setGlobalTitle={setGlobalTitle}
            globalStart={globalStart}
            setGlobalStart={setGlobalStart}
            globalEnd={globalEnd}
            setGlobalEnd={setGlobalEnd}
            globalAttendees={globalAttendees}
            setGlobalAttendees={setGlobalAttendees}
            globalExtraAttendee={globalExtraAttendee}
            setGlobalExtraAttendee={setGlobalExtraAttendee}
            globalDescription={globalDescription}
            setGlobalDescription={setGlobalDescription}
            globalAddMeetLink={globalAddMeetLink}
            setGlobalAddMeetLink={setGlobalAddMeetLink}
            isGlobalModalLoading={isGlobalModalLoading}
            userRole = {getCookie("USER_ROLE")}
          />
      }


   

      {/* {showGlobalModal && (
        <div className="meeting-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeGlobalModal()}>
          <div className="meeting-modal-content">
            <div className="modal-header">
              <h3>{isEditingEvent ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
              <button className="close-button" onClick={closeGlobalModal}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <form className="meeting-form" onSubmit={handleMeetingSubmit}>
              <div className="form-group">
                <label>Meeting Title</label>
                <input 
                  required 
                  placeholder="Enter meeting title" 
                  value={globalTitle}
                  onChange={(e) => setGlobalTitle(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={globalStart}
                    onChange={(e) => setGlobalStart(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={globalEnd}
                    onChange={(e) => setGlobalEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Skill Agency Email</label>
                  <input 
                    placeholder="skill.seeker@example.com" 
                    value={globalAttendees}
                    readonly={true} 
                    onChange={(e) => setGlobalAttendees(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Skill Owner Email</label>
                  <input 
                    placeholder="skill.owner@example.com" 
                    value={globalExtraAttendee}
                    readonly={true}
                    onChange={(e) => setGlobalExtraAttendee(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Enter meeting description..." 
                  value={globalDescription}
                  onChange={(e) => setGlobalDescription(e.target.value)}
                />
              </div>
              <div className="form-group form-group-inline">
                <label htmlFor="add-meet-link-checkbox">
                  Add Google Meet link
                </label>
                <input
                  type="checkbox"
                  id="add-meet-link-checkbox"
                  checked={globalAddMeetLink}
                  onChange={e => setGlobalAddMeetLink(e.target.checked)}
                />
              </div>
              <div className="meeting-modal-actions">
                <button type="button" className="cancel-button" onClick={closeGlobalModal}>
                  Cancel
                </button>
                <button type="submit" className="create-button" disabled={isGlobalModalLoading}>
                  {isGlobalModalLoading 
                    ? (isEditingEvent ? 'Updating...' : 'Creating...') 
                    : (isEditingEvent ? 'Update Meeting' : 'Create Meeting')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
       </div>)}
    </div>
  );
}

export default React.memo(CourseCalendarScheduleMeeting);