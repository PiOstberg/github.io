---
title: 'Wyvern'
date: 2024-06-14T00:00:00+01:00
image: 'wyvern.png'
draft: false
summary: 'Cross-Platform C++ Game Engine'
tags: ['C++', 'Engine']
params:
    description: 'One Engine, Some Platforms'
---

<style>
table, th, td {
  border:1px dotted #F3F5F6;
  border-collapse: collapse;
}
th, td {
  padding: 4px;
}
</style>

Wyvern is my personal 3D game engine that I am developing for two main reasons.
1. To teach myself more about engine and system development.
2. disappointment in already existing ones, such as Unity or Unreal Engine.

While it obviously doesn't stand the test of immense power that those engines have, Wyvern allows me to more easily develop projects in the way I want to, that is, using actual code.  


[Demo of a slightly older version of Wyvern](https://argore.itch.io/wyvern-demo?password=psq)


The source can be found on [the github repository](https://github.com/argoreofficial/wyvern). NDA bound platform-specific code is kept on a private server.  

### Libraries and frameworks Wyvern uses:

| GLFW | SDL | Assimp | stb_image | ImGUI | JoltPhysics | MiniAudio | fkYAML | json11 |
|-|-|-|-|-|-|-|-|-|
| Window<br>Handling | Window<br>Handling | Model<br>Parsing | Image<br>Loading | Debug UI | Physics | Audio | yaml<br>parsing | json<br>parsing |

Wyvern also uses **[xmake](https://xmake.io/)**, an open source Lua based build tool.  

## Platforms
Currently only Windows is actively maintained, but WASM has worked, and a barebones PSVita implementation exists (officially licensed software and hardware)

## The Engine
Wyvern uses a configuration setup, where the developer implements the wv::iApplication interface. This is used to set up and configure the engine and it’s subsystems, as well as inform the reflection system about any custom classes they may have implemented. Ownership of everything is then passed to the engine.

![](/images/wyvern/anorlondo.png)  
<sup>All of Anor Londo from Dark Souls being rendered as a static mesh object.</sup>

<div class="video-container">
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/UpJr3EC53gM?si=qSCGARza-jtu-356"></iframe></div>
    </div>
</div>

## Physics

I chose to use Jolt Physics for real-time rigidbody physics. It's implemented under a farily shallow wrapper to avoid any library-specific code leaking into Engine or Application code.

![](/images/wyvern/physicsballs.png)

<div class="video-container">
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/SPNBPj9qqAc?si=0peLcrDfwbRkxctB"></iframe></div>
    </div>
</div>

## Reflection

Since C++ doesn't have native class reflection I developed my own system that takes advantage of static template variables.  

Reflecting a class is as simple as using the `REFLECT_CLASS()` helper macro (which expands into actual code, *unlike a certain AAA engine*).
The reflection system will automatically detect the `createInstance` and `parseInstance` functions if they are present.  
`parseInstance` is required for scene object classes.  

A basic reflected class:
```cpp
#pragma once
#include <wv/Reflection/Reflection.h>

class cPrinter
{
public:
    cPrinter()
    {
        printf( "a cPrinter was created\n" );
    }

    static cPrinter* createInstance( void )                  { return new cPrinter(); }
    static cPrinter* parseInstance ( wv::sParseData& _data ) { return new cPrinter(); }
}

REFLECT_CLASS( cPrinter );
```
It also works on templated classes, although each template has to be reflected individually.  
A system that allows generic template reflection is planned, but is still an unsolved problem.  
```cpp
REFLECT_CLASS( cPrinter<int>   );
REFLECT_CLASS( cPrinter<float> );
REFLECT_CLASS( cPrinter<bool>  );
```
Creating an instance of a reflected class would then be done through the `cReflectionRegistry` class
```cpp
iSomeBaseClass* obj1 = wv::cReflectionRegistry::createClassInstance( "cDerivedClass" );
iSomeBaseClass* obj2 = wv::cReflectionRegistry::createClassInstance( "cDerivedTemplate<bool>" );
iSomeBaseClass* obj3 = wv::cReflectionRegistry::createClassInstance( "cDerivedTemplate<char>" );
```
