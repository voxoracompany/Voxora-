import React, {
  createContext,
  useContext,
  useState,
} from "react";


type ActivityContextType = {
  activities: string[];
  addActivity: (activity: string) => void;
};


const ActivityContext =
  createContext<ActivityContextType | undefined>(
    undefined
  );


export const ActivityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [activities, setActivities] =
    useState<string[]>([]);


  const addActivity = (
    activity: string
  ) => {

    setActivities((prev) => [
      activity,
      ...prev,
    ]);

  };


  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};


export const useActivity = () => {

  const context =
    useContext(ActivityContext);


  if (!context) {
    throw new Error(
      "useActivity must be used inside ActivityProvider"
    );
  }


  return context;
};