import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiService {
  ApiService({required this.baseUrl});

  final String baseUrl;

  Future<List<dynamic>> fetchObjects({
    required String telegramUserId,
    String? status,
  }) async {
    final uri = Uri.parse('$baseUrl/api/objects').replace(
      queryParameters: {
        'telegramUserId': telegramUserId,
        if (status != null) 'status': status,
      },
    );

    final response = await http.get(uri);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Failed to fetch objects');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['items'] as List<dynamic>? ?? [];
  }

  Future<void> updateObjectStatus({
    required String objectId,
    required String telegramUserId,
    required String status,
  }) async {
    final uri = Uri.parse('$baseUrl/api/objects/$objectId/status');

    final response = await http.patch(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'telegramUserId': telegramUserId,
        'status': status,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Failed to update object status');
    }
  }
}
