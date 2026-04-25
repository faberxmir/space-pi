## state - unassigned;
As long as any of these rules apply, the ship is in this state
- the group pilot has no members
- the group pilot as more than one members

**Web gui**;
- if no users are members of the pilot group.
  - factory settings are output to the console on the web gui.
  - log each key-value pair on separate lines like this key: value
- if more than one pilot are members of the pilot group
  - log "To many pilots" to the console 
- the web gui is not password protected, but shows the gui without pilot and without a terminal
- in the terminal area, the user can see a matrix like animation, falling characters art style like the movie "Matrix"
- the oled shows the ip address of the system.
- there is not really anything to interact with.
- terminal is unavailable. 

**Game rules**
- in this state, the ship cannot be attacked, it is considered to be docked.

**transition**
if transitioning to this state, play a negative fanfare and flash the leds three times.

**Oled**
shows the ip address of the device.

## state - assigned
As long as these rules apply, the ship is in assigned state
- the group pilot in the underlying OS has exactly one member
- the user has created a pilot.json in the home folder, and it can be validated according to the instructions in factory-settings.json;
  - the image has to be checked that it is a valid image that can be loaded by the web-gui.
- the user in the pilot group is the exact user that has the pilot.json

**Web gui**;
- factory settings are no longer output to the console.
- the cockpit gui is visible
- the terminal area of the cockpit has two states;
  - not logged in; the terminal shows in linux style that it expects the user to log in; in other words a login prompt
  - logged in. The user now has terminal access to use all the commands that will be made available in the future.

**terminal**
- the login prompt should exactly mimic linux; show "login:" where user types in username, then "password:" where user types password. 
- the login should not be the pilotname, but an actualy username on the underlying system.

**Oled**
when transistion to this state, an animation with sound should play out on the oled;
 1. The text "Ship has been claimed by" should appear at the bottom, and move towards the top of the oled using two seconds"
    Two short "deep" beeps should be played at the buzzer.
 2. when step one is complete, the text from 1 should be erased and the pilot name from "pilot.json" should appear centered in the 
    oled and stay there for 3 seconds.
    The buzzer should play a fanfare lasting for the full three seconds
 3. when step 2 is complete, in small letters in the top half of the oled should show "ship name:" then below that, centered on the oled 
    in large letters should show shipName from "pilot.json" lasting for 3 seconds.
 4. When state 3 is completed, transition to this state. In this state, the oled should show the ship status screen. This screen will be
    described in more detail in another iteration.

**Game rules**
- in this state, the ship can be attacked.

## Security states
The security states are a hierarchy. The ship can only have one security state at a time, meaning that this is a progression. 

### state - secure level 0
Secure level 0 is a state independent from assigned or unassigned. The ship is in this state these rules apply
- the OS password matches the password in cockpit/factory-settings.json

**web gui**
- assigned state; the frame around the pilot section is animated and has a red glow, moving between bright and slightly dimmer
- unassigned; not affected.

### state - secure level 1
Secure level 1 is a state independent from assigned or unassigned. The ship is in this state if one, but not both of these rules apply.
- the user has changed the password on the OS so it no longer matches the password in cockpit/factory-settings.json.
OR
- the user has changed ssh settings on the OS so it no longer accepts password on ssh, but insists on key exchange instead.

**Web gui**
- assigned state; the frame around the pilot section is animated and has a green glow, moving between bright and slightly dimmer
- unassigned; not affected.

### state - secure level 2
Secure level 2 is like secure level 1 independent from from assigned or unassigned. But these rules have to be satisfied
- the user has changed the password on the OS so it no longer matches the password in cockpit/factory-settings.json.
AND
- the user has changed ssh settings on the OS so it no longer accepts password on ssh, but insists on key exchange instead.

**Web gui**
- assigned state; the frame around the pilot section is animated and has a steady blue glow.
- unassigned; not affected.