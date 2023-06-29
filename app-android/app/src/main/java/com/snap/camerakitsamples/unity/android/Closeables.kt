@file:JvmName("Closeables")

package com.snap.camerakitsamples.unity.android

import java.io.Closeable

internal fun Closeable.addTo(closeables: MutableList<Closeable>) = apply { closeables.add(this) }