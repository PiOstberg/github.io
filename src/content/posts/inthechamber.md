---
title: 'In the Chamber'
date: 2024-05-17T00:00:00+01:00
image: 'inthechamber.png'
draft: false
summary: 'Twin-Stick Unlooter Shooter'
tags: ['Game', 'C++', 'UnrealEngine5']
params:
    description: 'Twin-Stick Unlooter Shooter'
---

In the Chamber is a twin-stick shooter where you play as a mummy defending the tomb from raiders.  
For this project I worked on;
* Developing helper systems for the gameplay programmers
* PlayStation®5 DualSense Haptic Feedback interfacing
* Enemy AI Behaviour
* Final Boss Behaviour. 

<div class="video-container">
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://player.vimeo.com/video/948702661"></iframe></div>
    </div>
</div>

---

## PlayStation 5 Haptics

For obvious reasons I cannot show a whole lot here. But here's a snippet of the blueprint nodes that allowed the gameplay programmers and designers to add rumble and trigger effects.

![](/images/inthechamber-triggereffectsweapon.png)
![](/images/inthechamber-triggereffectsfeedback.png)

---

## Interpolation Helper
Our designers was struggling with figuring out interpolating values over time, so I worked on creating a basic lerp timer blueprint

![](/images/inthechamber-timer.png)
### BHTimer.h
<details>
<summary> Click to expand code block </summary>

```cpp
// inherit from FTickableGameObject and will therefore tick as if it is an Actor, but without requiring an instance
UCLASS()
class INTHECHAMBER_API UBHTimer : public UObject, public FTickableGameObject
{
	GENERATED_BODY()

public:
	// FTickableGameObject Begin
	virtual void Tick(float DeltaTime) override;
	virtual ETickableTickType GetTickableTickType( void ) const override { return ETickableTickType::Always; }
	virtual TStatId           GetStatId          ( void ) const override { RETURN_QUICK_DECLARE_CYCLE_STAT( UBHTimer, STATGROUP_Tickables ); }
	
	virtual bool IsTickableWhenPaused( void ) const override { return true; }
	virtual bool IsTickableInEditor  ( void ) const override { return false; }
	// FTickableGameObject End

	UFUNCTION( BlueprintCallable, Category = "Blueprint Helper Timer" )
	static FLerpTimerHandle createLerpTimer( FLerpDelegate Event, ELerpTimerModifier modifier, float startValue, float min = 0.0f, float max = 1.0f );

	UFUNCTION( BlueprintCallable, Category = "Blueprint Helper Timer" )
	static void startLerpTimer( FLerpTimerHandle timer, float target, float time, bool destroyOnFinished = false );
	
    /*
    
    ... and a bunch of other functions ...

    */

private:
	uint32 LastFrameNumberWeTicked = INDEX_NONE;
};
```
</details>

### BHTimer.cpp
<details>
<summary> Click to expand code block </summary>

```cpp
void UBHTimer::Tick( float DeltaTime )
{

	if ( LastFrameNumberWeTicked == GFrameCounter )
		return;


	// remove timers marked for delete
	TArray<int32> timersMarkedForDelete;
	for ( auto& timerPair : lerpTimers )
	{
		if( timerPair.Value.MarkedForDelete )
			timersMarkedForDelete.Push( timerPair.Key );	
	}
	
	for (int i = 0; i < timersMarkedForDelete.Num(); i++)
		lerpTimers.FindAndRemoveChecked( timersMarkedForDelete[ i ] );
 

	// run tick on living timers
	for ( auto& TimerPair : lerpTimers )
	{
		FLerpTimer& Timer = TimerPair.Value;

		if( !Timer.Running || !Timer.Event.IsBound() )
			continue;
		
		Timer.InternalTimer += DeltaTime / Timer.Time;
		Timer.InternalTimer = FMath::Clamp( Timer.InternalTimer, 0.0f, 1.0f );
		Timer.CurrentValue  = FMath::Lerp( Timer.From, Timer.To, Timer.InternalTimer );

		if( Timer.Modifier == ELerpTimerModifier::Clamp )
			Timer.CurrentValue = FMath::Clamp( Timer.CurrentValue, Timer.Min, Timer.Max );
		else if( Timer.Modifier == ELerpTimerModifier::Wrap )
			Timer.CurrentValue = FMath::Wrap( Timer.CurrentValue, Timer.Min, Timer.Max );
		
		const bool ReachedTarget = Timer.InternalTimer >= 1.0f;
		Timer.Event.Execute( Timer.CurrentValue, ReachedTarget, { TimerPair.Key } );

		if ( ReachedTarget && Timer.DestroyOnFinished )
			Timer.MarkedForDelete = true;
	}
	
	LastFrameNumberWeTicked = GFrameCounter;

}

```
</details>

### Bonus; `Get Available Ammo Slot` Blueprint Node
<details>
<summary> Click to expand code block </summary>

```cpp
int32 UBHMisc::getAvailableAmmoSlot( float& angle, TArray<TEnumAsByte<EBulletWidgetState>> bulletStates, EBulletWidgetState match, bool reversed )
{
	int FoundIndex = 0;

	if( !reversed ) // get first available chamber slot clock-wise
	{
		for (int i = 0; i < bulletStates.Num(); i++)
		{
			if( bulletStates[ i ] != match )
				continue;

			FoundIndex = i;
			break;
		}
	}
	else // get first available chamber slot counter-clock-wise
	{
		for (int i = bulletStates.Num() - 1; i >= 0; i--)
		{
			if( bulletStates[ i ] != match )
				continue;

			FoundIndex = i;
			break;
		}
	}

    // 6 slot chamber, 60 degrees between each chamber 
    angle = FoundIndex * 60.0f;

	return FoundIndex;
}

```
</details>

---

## Final Boss Battle

At the end of the project I also got assigned to work on the final boss battle.  
Most of this was built using already existing AI systems and such that I didn't work on so I won't include those.

![](/images/inthechamber-boss.png)  
<sup>The boss level in Unreal Engine 5 with all the triggers, spawn areas, and tools</sup>

<div style="max-width: 720px">
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/inthechamber-bossroom.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>
<sup>Demo of the Boss' Wave attack</sup>