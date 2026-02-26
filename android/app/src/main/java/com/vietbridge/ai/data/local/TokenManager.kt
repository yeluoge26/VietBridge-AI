package com.vietbridge.ai.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

class TokenManager(context: Context) {
    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        "vietbridge_secure_prefs",
        MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    var token: String?
        get() = prefs.getString(KEY_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_TOKEN, value).apply()

    var userJson: String?
        get() = prefs.getString(KEY_USER, null)
        set(value) = prefs.edit().putString(KEY_USER, value).apply()

    /** Guest UUID — generated once, persisted across sessions */
    val guestId: String
        get() {
            var id = prefs.getString(KEY_GUEST_ID, null)
            if (id == null) {
                id = java.util.UUID.randomUUID().toString()
                prefs.edit().putString(KEY_GUEST_ID, id).apply()
            }
            return id
        }

    val isAuthenticated: Boolean get() = token != null

    fun clear() {
        val savedGuestId = prefs.getString(KEY_GUEST_ID, null)
        prefs.edit().clear().apply()
        // Preserve guest ID across sign-outs
        if (savedGuestId != null) {
            prefs.edit().putString(KEY_GUEST_ID, savedGuestId).apply()
        }
    }

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER = "user_json"
        private const val KEY_GUEST_ID = "guest_id"
    }
}
