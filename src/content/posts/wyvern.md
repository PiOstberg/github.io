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

<div class="marquee" style="--marquee-items: 5">
  <img class="marquee__item" style="--n: 0" src="/images/wyvern/marquee-physics.png" alt="">
  <img class="marquee__item" style="--n: 1" src="/images/wyvern/marquee-physics2.png" alt="">
  <img class="marquee__item" style="--n: 2" src="/images/wyvern/marquee-anor.png" alt="">
  <img class="marquee__item" style="--n: 3" src="/images/wyvern/marquee-level.png" alt="">
  <img class="marquee__item" style="--n: 4" src="/images/wyvern/marquee-starwars.png" alt="">
</div>
<br>

**Wyvern** is a 3D Game Engine developed entirely by me. It's built to support multiple backends with Windows and PSVita* support.  
<sup>* officially licensed developers only</sup>  
<sup>WASM demo can be found [here](https://argore.itch.io/wyvern-demo?password=psq) but is no longer actively supported</sup>

The source can be found on [the github repository](https://github.com/argoreofficial/wyvern). NDA bound platform-specific code is kept on a private server.  
Wyvern uses **[xmake](https://xmake.io/)**, an open source Lua based build tool.  

# Table of Contents
1. [The Engine](#theengine)
1. [Rendering](#rendering)
1. [Physics](#physics)
1. [Reflection](#reflection)

<br><br>

# The Engine <a name="theengine"></a>
Wyvern uses a configuration setup, where the developer implements the wv::iApplication interface. This is used to set up and configure the engine and it’s subsystems, as well as inform the reflection system about any runtime classes. Ownership of everything is then passed to the engine.

<br><br>

# Rendering <a name="rendering"></a>
Currently only OpenGL 4.6 is available. However the API is backend-non-specific as to allow multiple implementations, such as the PSVita.  
Wyvern supports most rendering types (direct, instanced, indirect). Currently render calls are done through the cMeshResource class, meaning there is one draw call per mesh object. This will be reworked to use *Shader Draw Buckets* which will reduce the draw call count to one per shader.

Features include:
* Singular/Monolithic vertex and index buffer
* Bindless resources
* Vertex Pulling
* Multi-Indirect Drawing
* Deferred Shading

![](/images/wyvern/anorlondo.png)  
<sup>All of Anor Londo from Dark Souls being rendered as a static mesh object.</sup>

<div class="video-container">
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/UpJr3EC53gM?si=qSCGARza-jtu-356"></iframe></div>
    </div>
</div>

<br><br>

# Physics <a name="physics"></a>

I chose to use Jolt Physics for real-time rigidbody physics. It's implemented under a farily shallow wrapper to avoid any library-specific code leaking into Engine or Application code.

![](/images/wyvern/physicsballs.png)

<div class="video-container">
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/SPNBPj9qqAc?si=0peLcrDfwbRkxctB"></iframe></div>
    </div>
</div>

<br><br>

# Reflection <a name="reflection"></a>

Because C++ doesn't have native class reflection I developed my own system that takes advantage of static template variables. Allowing classes to be reflected at near compile-time, with only some work being done at application startup.

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
