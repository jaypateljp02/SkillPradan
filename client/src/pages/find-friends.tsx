import { useEffect } from "react";
import { useLocation } from "wouter";

export default function FindFriendsPage() {
    const [, setLocation] = useLocation();

    useEffect(() => {
        setLocation("/messages?mode=find-friends");
    }, [setLocation]);

    return null;
}
